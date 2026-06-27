import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { ndviToColor, _rgba } from './colorUtils';

/**
 * Renders a smooth, blended vegetation-index heatmap as an L.ImageOverlay
 * anchored to the farm's geographic bounds.
 *
 * Because it's a real Leaflet ImageOverlay (not a screen-space canvas), the map
 * zoom-animates it natively — it stays perfectly glued to the polygon on zoom
 * and pan, with no manual transforms. The heatmap is rendered once per
 * data/band change into an off-screen canvas (clipped to the boundary) and
 * pushed to the overlay as an image.
 */
export default function HeatmapLayer({ data, activeBand, farmBoundary }) {
    const map = useMap();
    const overlayRef = useRef(null);

    useEffect(() => {
        if (!map || !data || !farmBoundary || !farmBoundary.coordinates) return;

        // Dedicated pane: above the satellite tiles, below the vector boundary
        // + hover cells, so the white outline always stays visible on top.
        if (!map.getPane('heatmapPane')) {
            map.createPane('heatmapPane');
            const p = map.getPane('heatmapPane');
            p.style.zIndex = 350;
            p.style.pointerEvents = 'none';
        }

        // Outer ring(s) as [lng, lat] pairs.
        const isMulti = farmBoundary.type === 'MultiPolygon';
        const outerRings = isMulti
            ? farmBoundary.coordinates.map(poly => poly[0])
            : [farmBoundary.coordinates[0]];

        // Geographic bounds of the field.
        const bounds = L.latLngBounds([]);
        outerRings.forEach(ring => ring.forEach(([lng, lat]) => bounds.extend([lat, lng])));
        if (!bounds.isValid()) return;

        const nwLL = bounds.getNorthWest();
        const seLL = bounds.getSouthEast();

        // Render at a fixed zoom chosen so the long edge is ~TARGET px. This is
        // independent of the live map zoom — the ImageOverlay scales the result
        // to the bounds, so resolution stays consistent and crisp-enough.
        const TARGET = 1400;
        const nw0 = map.project(nwLL, 0);
        const se0 = map.project(seLL, 0);
        const w0 = Math.abs(se0.x - nw0.x) || 1;
        const h0 = Math.abs(se0.y - nw0.y) || 1;
        const z = Math.log2(TARGET / Math.max(w0, h0));

        const nw = map.project(nwLL, z);
        const se = map.project(seLL, z);
        const W = Math.max(1, Math.round(Math.abs(se.x - nw.x)));
        const H = Math.max(1, Math.round(Math.abs(se.y - nw.y)));

        const toPx = (lat, lng) => {
            const p = map.project([lat, lng], z);
            return { x: p.x - nw.x, y: p.y - nw.y };
        };

        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, W, H);

        // Soften so the blended blobs read as a continuous surface.
        ctx.filter = `blur(${Math.max(4, Math.round(W / 150))}px)`;

        // Clip to the farm boundary.
        ctx.save();
        ctx.beginPath();
        for (const ring of outerRings) {
            ring.forEach(([lng, lat], i) => {
                const p = toPx(lat, lng);
                if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
            });
            ctx.closePath();
        }
        ctx.clip();

        const features = data.features || [];

        // Multi-pass radial-gradient blending for an EOS-style continuous look.
        const PASSES = [
            { op: 'source-over', mult: 2.2, min: 24, stops: [[0, 0.7], [0.35, 0.55], [0.65, 0.3], [1, 0]] },
            { op: 'source-atop', mult: 1.5, min: 16, stops: [[0, 0.85], [0.4, 0.6], [0.75, 0.25], [1, 0]] },
            { op: 'source-atop', mult: 0.9, min: 10, stops: [[0, 0.6], [0.5, 0.3], [1, 0]] },
        ];

        for (const pass of PASSES) {
            ctx.globalCompositeOperation = pass.op;
            for (const feature of features) {
                const val = feature.properties[activeBand];
                if (val === null || val === undefined || isNaN(val)) continue;

                const ring = feature.geometry.coordinates[0];
                let sumLng = 0, sumLat = 0;
                ring.forEach(([lng, lat]) => { sumLng += lng; sumLat += lat; });
                const center = toPx(sumLat / ring.length, sumLng / ring.length);

                let maxR = 0;
                ring.forEach(([lng, lat]) => {
                    const p = toPx(lat, lng);
                    maxR = Math.max(maxR, Math.hypot(p.x - center.x, p.y - center.y));
                });
                const radius = Math.max(maxR * pass.mult, pass.min);

                const renderVal = activeBand === 'ndvi' ? Math.trunc(val * 100) / 100 : val;
                const color = ndviToColor(renderVal);
                const grad = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, radius);
                pass.stops.forEach(([stop, a]) => grad.addColorStop(stop, _rgba(color, a)));

                ctx.beginPath();
                ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();
            }
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        ctx.filter = 'none';

        const url = canvas.toDataURL('image/png');

        if (overlayRef.current) {
            overlayRef.current.setBounds(bounds);
            overlayRef.current.setUrl(url);
        } else {
            overlayRef.current = L.imageOverlay(url, bounds, {
                pane: 'heatmapPane',
                opacity: 0.9,
                interactive: false,
                className: 'cv-heatmap',
            }).addTo(map);
        }
    }, [map, data, activeBand, farmBoundary]);

    // Remove the overlay when this layer unmounts (e.g. switching fields).
    useEffect(() => {
        return () => {
            if (overlayRef.current) {
                overlayRef.current.remove();
                overlayRef.current = null;
            }
        };
    }, []);

    return null;
}
