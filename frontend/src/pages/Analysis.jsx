/**
 * Analysis.jsx — Main map/analysis dashboard page.
 *
 * This is the full satellite analysis experience from the original App.jsx,
 * adapted as a routed page within the new BrowserRouter shell.
 * All GEE analysis features are preserved exactly.
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MapView from '../MapView';
import Sidebar from '../Sidebar';
import Legend from '../Legend';
import LoadingOverlay from '../LoadingOverlay';
import TimelineBar from '../TimelineBar';
import NavbarDropdown from '../NavbarDropdown';
import { analyzeFarm, fetchAvailableDates, fetchDayAnalysis, fetchRadarAnalysis, fetchRadarDates } from '../api';
import { radarToColor } from '../colorUtils';
import * as turf from '@turf/turf';
import { ChevronLeft, ChevronRight, Pencil, LocateFixed } from 'lucide-react';
import FieldNameModal from '../FieldNameModal';

// Sentinel-2 vegetation index dropdown options.
const VEG_BAND_OPTIONS = [
  { value: 'ndvi', label: 'NDVI' },
  { value: 'evi', label: 'EVI' },
  { value: 'savi', label: 'SAVI' },
  { value: 'ndmi', label: 'NDMI' },
  { value: 'gndvi', label: 'GNDVI' },
  { value: 'cvi', label: 'CVI' },
];

// Sentinel-1 radar / soil-moisture layer dropdown options.
const RADAR_BAND_OPTIONS = [
  { value: 'smi', label: 'Soil Moisture (SMI)' },
  { value: 'rvi', label: 'Radar Vegetation (RVI)' },
  { value: 'ratio', label: 'VV/VH Ratio' },
  { value: 'vv', label: 'VV Polarization' },
  { value: 'vh', label: 'VH Polarization' },
];

export default function Analysis() {
  const navigate = useNavigate();

  // ── User state ─────────────────────────────────────────────────────────────
  const [user] = useState(() => {
    try {
      const stored = localStorage.getItem('agri_farmer');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const handleLogout = () => {
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_farmer_id');
    localStorage.removeItem('agri_farmer');
    navigate('/', { replace: true });
  };

  // ── Dashboard state ────────────────────────────────────────────────────────
  const [activeBand, setActiveBand] = useState('ndvi');
  const [mapCenter, setMapCenter]   = useState([18.1676592, 75.8131346]);
  const [locating, setLocating]     = useState(false);

  // ── Sentinel-1 radar / soil-moisture state (independent of the S2 path) ──────
  const [source, setSource] = useState('sentinel2');   // 'sentinel2' | 'sentinel1'
  const [activeRadarBand, setActiveRadarBand] = useState('smi');
  const radarLoadingRef = useRef(new Set());           // field ids with an in-flight radar load

  // Multi-field state
  const [fields, setFields]               = useState([]);
  const [activeFieldId, setActiveFieldId] = useState(null);
  const [editingFieldId, setEditingFieldId] = useState(null);
  /** Snapshot when entering edit mode — polygon positions stay stable while dragging. */
  const [editBoundarySnapshot, setEditBoundarySnapshot] = useState(null);
  /** Latest geometry while dragging vertices; committed on Done only. */
  const editGeometryRef = useRef(null);
  const [editNameDraft, setEditNameDraft] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  /** Ask for field name after draw (`new`) or from dropdown rename (`rename`). */
  const [nameModal, setNameModal] = useState(null);

  // Loading state
  const [isLoading, setIsLoading]       = useState(false);
  const [currentStep, setCurrentStep]   = useState(0);
  const [isDayLoading, setIsDayLoading] = useState(false);

  // Derived state for the currently selected field
  const activeField    = fields.find(f => f.id === activeFieldId);
  const analysisData   = activeField?.analysisData || null;
  const availableDates = activeField?.availableDates || [];
  const selectedDate   = activeField?.selectedDate || null;

  // ── Source-aware derived values (radar vs vegetation) ────────────────────────
  const isRadar        = source === 'sentinel1';
  const activeMapBand  = isRadar ? activeRadarBand : activeBand;
  const radarData      = activeField?.radarData || null;
  // What actually feeds the map/legend/timeline for the current source.
  const displayData    = isRadar ? radarData : analysisData;
  const displayDates   = isRadar ? (activeField?.radarDates || []) : availableDates;
  const displayDate    = isRadar ? (activeField?.radarSelectedDate || null) : selectedDate;
  const colorFn        = isRadar ? radarToColor : null;

  // ── Radar data loading (lazy, per field + date, cached) ──────────────────────
  const runRadarLoad = async (fieldId) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || radarLoadingRef.current.has(fieldId)) return;
    radarLoadingRef.current.add(fieldId);
    setIsDayLoading(true);
    try {
      let dates = field.radarDates;
      if (!dates || dates.length === 0) {
        try {
          const dr = await fetchRadarDates(field.geometry);
          dates = dr.dates || [];
        } catch (dErr) {
          console.warn('Could not fetch radar dates:', dErr);
          dates = [];
        }
      }
      const latest = dates.length ? dates[dates.length - 1] : null;
      const data = await fetchRadarAnalysis(field.geometry, latest);
      if (data.error) console.warn('Radar analysis:', data.error);

      setFields(prev => prev.map(f => f.id === fieldId ? {
        ...f,
        radarDates: dates,
        radarSelectedDate: latest,
        radarData: data.error ? null : data,
        radarCache: {
          ...(f.radarCache || {}),
          ...(latest && !data.error ? { [latest]: data } : {}),
        },
      } : f));
    } catch (err) {
      console.error('Radar load failed:', err);
    } finally {
      radarLoadingRef.current.delete(fieldId);
      setIsDayLoading(false);
    }
  };

  // Load radar for the active field the first time it's needed in radar mode.
  useEffect(() => {
    if (!isRadar || !activeFieldId) return;
    const f = fields.find(ff => ff.id === activeFieldId);
    if (f && f.geometry && !f.radarData && !radarLoadingRef.current.has(activeFieldId)) {
      void runRadarLoad(activeFieldId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRadar, activeFieldId, fields]);

  const handleSourceChange = (val) => {
    setSource(val);
  };

  const handleRadarDateSelect = async (date) => {
    if (!activeField || date === activeField.radarSelectedDate) return;

    setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, radarSelectedDate: date } : f));

    // Serve from cache when we already computed this (polygon, date).
    const cached = activeField.radarCache?.[date];
    if (cached) {
      setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, radarData: cached } : f));
      return;
    }

    setIsDayLoading(true);
    try {
      const data = await fetchRadarAnalysis(activeField.geometry, date);
      if (data.error) {
        console.warn(`No radar data for ${date}: ${data.error}`);
      } else {
        setFields(prev => prev.map(f => f.id === activeFieldId ? {
          ...f,
          radarData: data,
          radarCache: { ...(f.radarCache || {}), [date]: data },
        } : f));
      }
    } catch (err) {
      console.error('Radar day analysis failed:', err);
    } finally {
      setIsDayLoading(false);
    }
  };

  const simulateProgress = () => {
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step <= 4) {
        setCurrentStep(step);
      } else {
        clearInterval(interval);
      }
    }, 1500);
    return interval;
  };

  const handleFlyTo = (coords) => {
    setMapCenter(coords);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapCenter([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 10000 }
    );
  };

  const handleDrawComplete = (geometry) => {
    setNameModal({ type: 'new', geometry });
  };

  const runNewFieldAnalysis = async (fieldName, geometry) => {
    setIsLoading(true);
    const progressTimer = simulateProgress();

    const areaSqMeters = turf.area(geometry);
    const areaHectares = (areaSqMeters / 10000).toFixed(2);
    const newFieldId = Date.now().toString();

    const newField = {
      id: newFieldId,
      name: fieldName.trim(),
      areaHectares,
      geometry,
      analysisData: null,
      availableDates: [],
      selectedDate: null,
    };

    try {
      const data = await analyzeFarm(geometry);
      if (data.error) {
        alert(`Error: ${data.error}`);
      } else {
        newField.analysisData = data;
      }

      try {
        const dateResult = await fetchAvailableDates(geometry);
        if (dateResult.dates && dateResult.dates.length > 0) {
          newField.availableDates = dateResult.dates;
          newField.selectedDate = dateResult.dates[dateResult.dates.length - 1];
        }
      } catch (dateErr) {
        console.warn('Could not fetch available dates:', dateErr);
      }

      setFields((prev) => [...prev, newField]);
      setActiveFieldId(newFieldId);
    } catch (err) {
      console.error(err);
      alert(err.message || 'Analysis failed.');
    } finally {
      clearInterval(progressTimer);
      setIsLoading(false);
      setCurrentStep(0);
    }
  };

  const handleConfirmFieldName = (name) => {
    const m = nameModal;
    if (!m) return;
    if (m.type === 'new') {
      const geometry = m.geometry;
      setNameModal(null);
      void runNewFieldAnalysis(name, geometry);
    } else {
      handleRenameField(m.fieldId, name);
      setNameModal(null);
    }
  };

  const fieldDropdownOptions = useMemo(() => {
    if (fields.length === 0) {
      return [{ value: 'empty', label: 'Draw to add field', disabled: true }];
    }
    return [
      ...fields.map((f) => ({ value: f.id, label: f.name })),
      { value: 'add_new', label: '+ Add new field' },
    ];
  }, [fields]);

  const handleDrawDelete = () => {
    if (activeFieldId) {
      setFields(prev => prev.filter(f => f.id !== activeFieldId));
      setActiveFieldId(null);
    }
  };

  const handleDateSelect = async (date) => {
    if (!activeField || date === activeField.selectedDate) return;

    setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, selectedDate: date } : f));
    setIsDayLoading(true);

    try {
      const dayData = await fetchDayAnalysis(activeField.geometry, date);
      if (dayData.error) {
        console.warn(`No data for ${date}: ${dayData.error}`);
      } else {
        setFields(prev => prev.map(f => f.id === activeFieldId ? { ...f, analysisData: dayData } : f));
      }
    } catch (err) {
      console.error('Day analysis failed:', err);
    } finally {
      setIsDayLoading(false);
    }
  };

  const handleRenameField = (id, newName) => {
    setFields(prev => prev.map(f => f.id === id ? { ...f, name: newName } : f));
  };

  /** While editing: only update ref so Leaflet handles stay mounted; no field state update per drag. */
  const handleGeometryEditLive = (id, newGeometry) => {
    if (id !== editingFieldId) return;
    editGeometryRef.current = newGeometry;
  };

  const handleCancelEditing = () => {
    setEditingFieldId(null);
    setEditBoundarySnapshot(null);
    editGeometryRef.current = null;
  };

  const handleFinishEditing = async () => {
    const id = editingFieldId;
    if (!id) return;

    const geom = editGeometryRef.current;
    setEditingFieldId(null);
    setEditBoundarySnapshot(null);
    editGeometryRef.current = null;

    if (!geom) return;

    const areaSqMeters = turf.area(geom);
    const areaHectares = (areaSqMeters / 10000).toFixed(2);

    setIsLoading(true);
    const progressTimer = simulateProgress();

    setFields((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, geometry: geom, areaHectares, analysisData: null, availableDates: [], selectedDate: null }
          : f
      )
    );

    try {
      const data = await analyzeFarm(geom);
      let newAvailableDates = [];
      let newSelectedDate = null;

      if (!data.error) {
        try {
          const dateResult = await fetchAvailableDates(geom);
          if (dateResult.dates && dateResult.dates.length > 0) {
            newAvailableDates = dateResult.dates;
            newSelectedDate = dateResult.dates[dateResult.dates.length - 1];
          }
        } catch (err) {
          console.warn(err);
        }
      }

      setFields((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                analysisData: data.error ? null : data,
                availableDates: newAvailableDates,
                selectedDate: newSelectedDate,
              }
            : f
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      clearInterval(progressTimer);
      setIsLoading(false);
      setCurrentStep(0);
    }
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__brand">
          <svg className="navbar__brand-logo" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="navbar__text">
            <span className="navbar__title">PRAGYA</span>
            <span className="navbar__tagline">Satellite farm monitoring</span>
          </div>
        </div>

        <div className="navbar__controls navbar__controls--end">
          <div className="navbar__group">
            <div className="navbar__selectors">
            {editingFieldId === activeFieldId && activeField ? (
                <>
                  <input
                    className="navbar__select navbar__select--field-name"
                    autoFocus
                    value={editNameDraft}
                    onChange={(e) => setEditNameDraft(e.target.value)}
                    placeholder="Field name"
                    aria-label="Field name"
                  />
                  <button
                    type="button"
                    className="btn btn--primary btn--sm"
                    onClick={() => {
                      const name = editNameDraft.trim();
                      if (name) handleRenameField(activeFieldId, name);
                      handleFinishEditing();
                    }}
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    className="btn btn--ghost btn--sm"
                    onClick={handleCancelEditing}
                  >
                    Cancel
                  </button>
                </>
            ) : (
                <div className="navbar__field-wrap">
                  <NavbarDropdown
                    value={activeFieldId || 'empty'}
                    onChange={(val) => {
                      if (val === 'add_new') {
                        setActiveFieldId(null);
                      } else {
                        setActiveFieldId(val);
                      }
                    }}
                    options={fieldDropdownOptions}
                  />
                  {activeFieldId && activeField && (
                    <button
                      type="button"
                      className="navbar__rename-field-btn"
                      title="Rename field"
                      aria-label="Rename field"
                      onClick={() =>
                        setNameModal({
                          type: 'rename',
                          fieldId: activeFieldId,
                          currentName: activeField.name,
                        })
                      }
                    >
                      <Pencil size={15} strokeWidth={2} aria-hidden />
                    </button>
                  )}
                </div>
            )}

            <button
              type="button"
              className={`navbar__locate-btn${locating ? ' locate-spin' : ''}`}
              title="My location"
              aria-label="Fly to my current location"
              onClick={handleLocate}
              disabled={locating}
            >
              <LocateFixed size={16} strokeWidth={2} aria-hidden />
            </button>

            {activeFieldId && editingFieldId !== activeFieldId && activeField && (
                <button
                  type="button"
                  className="navbar__link-btn"
                  onClick={() => {
                    const g = activeField.geometry;
                    try {
                      editGeometryRef.current = structuredClone(g);
                    } catch {
                      editGeometryRef.current = JSON.parse(JSON.stringify(g));
                    }
                    try {
                      setEditBoundarySnapshot(structuredClone(g));
                    } catch {
                      setEditBoundarySnapshot(JSON.parse(JSON.stringify(g)));
                    }
                    setEditNameDraft(activeField.name || '');
                    setEditingFieldId(activeFieldId);
                  }}
                  title="Edit field boundary"
                >
                  Edit boundary
                </button>
            )}
            <div className="navbar__select-divider" aria-hidden="true" />
          </div>
          </div>

          <div className="navbar__group">
          <div className="navbar__selectors">
            <NavbarDropdown
                value={source}
                onChange={handleSourceChange}
                options={[
                    { value: "sentinel2", label: "Sentinel-2" },
                    { value: "sentinel1", label: "Sentinel-1 (Radar)" },
                ]}
            />

            <div className="navbar__select-divider"></div>

            <NavbarDropdown
                value={isRadar ? activeRadarBand : activeBand}
                onChange={(val) => (isRadar ? setActiveRadarBand(val) : setActiveBand(val))}
                options={isRadar ? RADAR_BAND_OPTIONS : VEG_BAND_OPTIONS}
            />
          </div>
          </div>

          <div className={`navbar__status ${isLoading ? 'is-loading' : displayData ? 'is-success' : 'is-idle'}`}>
            <div className="status-dot"></div>
            <span>{isLoading ? 'Analyzing…' : displayData ? 'Ready' : 'Awaiting field'}</span>
          </div>

          <div className="navbar__user-bar">
            {user?.name && (
              <span className="navbar__user-phone">{user.name}</span>
            )}
            <button type="button" className="btn btn--danger-outline btn--sm" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </nav>

      <div className={`app-layout${sidebarCollapsed ? ' app-layout--sidebar-collapsed' : ''}`}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onFlyTo={handleFlyTo}
          analysisData={analysisData}
          activeBand={activeBand}
          activeFieldId={activeFieldId}
          activeField={activeField}
        />
        <button
          type="button"
          className="sidebar-edge-toggle"
          onClick={() => setSidebarCollapsed((c) => !c)}
          aria-expanded={!sidebarCollapsed}
          aria-controls="farm-assistant-sidebar"
          title={sidebarCollapsed ? 'Show assistant panel' : 'Hide assistant panel'}
        >
          {sidebarCollapsed ? (
            <ChevronRight size={15} strokeWidth={2} aria-hidden />
          ) : (
            <ChevronLeft size={15} strokeWidth={2} aria-hidden />
          )}
        </button>

        <main className="map-wrapper">
          <MapView
              center={mapCenter}
              activeBand={activeMapBand}
              analysisData={displayData}
              activeFieldId={activeFieldId}
              editingFieldId={editingFieldId}
              editBoundarySnapshot={editBoundarySnapshot}
              fields={fields}
              onDrawComplete={handleDrawComplete}
              onDrawDelete={handleDrawDelete}
              onGeometryEdit={handleGeometryEditLive}
              showDrawHint={fields.length === 0 && !editingFieldId}
              colorFn={colorFn}
              radarMode={isRadar}
          />

          {displayData && activeFieldId && (
              <Legend
                  activeLayer={activeMapBand}
                  histogramData={isRadar ? undefined : analysisData?.farm_summary?.ndvi_histogram}
              />
          )}

          {/* Timeline bar at the bottom — shows available dates for the active source */}
          {displayDates.length > 0 && (
              <TimelineBar
                  dates={displayDates}
                  selectedDate={displayDate}
                  onDateSelect={isRadar ? handleRadarDateSelect : handleDateSelect}
                  isLoading={isDayLoading}
              />
          )}

          <LoadingOverlay isVisible={isLoading} currentStepIdx={currentStep} />

          {/* Day loading mini indicator */}
          {isDayLoading && !isLoading && (
              <div className="day-loading-indicator">
                  <div className="day-loading-spinner" />
                  <span>Loading imagery…</span>
              </div>
          )}
        </main>
      </div>

      <FieldNameModal
        open={nameModal !== null}
        title={nameModal?.type === 'rename' ? 'Rename field' : 'Name this field'}
        description={
          nameModal?.type === 'new'
            ? 'Satellite analysis runs after you confirm the name.'
            : undefined
        }
        initialName={
          nameModal?.type === 'rename'
            ? nameModal.currentName || ''
            : `Field ${fields.length + 1}`
        }
        confirmLabel={nameModal?.type === 'rename' ? 'Save' : 'Run analysis'}
        onConfirm={handleConfirmFieldName}
        onCancel={() => setNameModal(null)}
      />
    </>
  );
}
