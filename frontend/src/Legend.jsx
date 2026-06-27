import React, { useState } from 'react';

// Compact 0.1-width bins so the list stays short and readable.
const LEGEND_BINS = [
    { range: '0.9–1',   label: 'Dense vegetation',    color: '#007e47' },
    { range: '0.8–0.9', label: 'Dense vegetation',    color: '#14aa60' },
    { range: '0.7–0.8', label: 'Dense vegetation',    color: '#77ca6f' },
    { range: '0.6–0.7', label: 'Healthy',             color: '#b9e383' },
    { range: '0.5–0.6', label: 'Moderate',            color: '#eaf7ac' },
    { range: '0.4–0.5', label: 'Moderate',            color: '#ffe093' },
    { range: '0.3–0.4', label: 'Sparse',              color: '#ffc67d' },
    { range: '0.2–0.3', label: 'Sparse',              color: '#ff8d5a' },
    { range: '0.1–0.2', label: 'Open soil',           color: '#ef4c3a' },
    { range: '<0.1',    label: 'Bare / water',        color: '#ad0028' },
];

// Low → high gradient used for the compact color scale bar.
const SCALE_GRADIENT =
  'linear-gradient(90deg, #ad0028, #e02d2c, #fe6c4a, #ffab69, #ffe093, ' +
  '#fdfec2, #d5ef94, #9bd873, #53bd6b, #14aa60, #007e47)';

/**
 * Legend — Floating map overlay showing the active index's color scale.
 * Collapsed by default; expands to the full per-bin breakdown.
 */
export default function Legend({ activeLayer }) {
  const [isOpen, setIsOpen] = useState(false);
  const band = (activeLayer || 'ndvi').toUpperCase();

  return (
    <div className="map-legend-overlay">
      <section className="card sidebar-legend" id="card-legend">
        <button
          className="sidebar-legend__toggle"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          type="button"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}
        >
          <span className="sidebar-legend__title-wrap">
            <span className="sidebar-legend__title">Legend</span>
            <span className="sidebar-legend__subtitle">{band} scale</span>
          </span>
          <span className={`sidebar-legend__chevron ${isOpen ? 'is-open' : ''}`}>▼</span>
        </button>

        {/* Compact color scale bar — always visible */}
        <div style={{ padding: '6px 2px 2px' }}>
          <div style={{ height: 10, borderRadius: 5, background: SCALE_GRADIENT }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--c-text-muted, #7a90a8)' }}>
            <span>Low</span>
            <span>High</span>
          </div>
        </div>

        {isOpen && (
        <div className="sidebar-legend__body">
          {LEGEND_BINS.map((bin, index) => (
            <div key={index} className="sidebar-legend__row">
              <div className="sidebar-legend__chip" style={{ backgroundColor: bin.color }} />
              <div className="sidebar-legend__range">{bin.range}</div>
              <div className="sidebar-legend__label">{bin.label}</div>
            </div>
          ))}
        </div>
      )}
      </section>
    </div>
  );
}
