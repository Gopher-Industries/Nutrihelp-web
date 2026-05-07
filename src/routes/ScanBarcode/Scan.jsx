import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScanBarcode from './ScanBarcode';
import ScanProducts from '../UI-Only-Pages/ScanProducts/ScanProducts';
import '../UI-Only-Pages/ScanProducts/ScanProducts.css';
import {
  SCAN_LOG_UPDATED_EVENT,
  readScanLogEntries,
  removeScanLogEntry,
  updateScanLogEntryMealType,
} from '../../utils/scanLogStorage';

const BOOKMARK_TAG_OPTIONS = [
  { value: 'breakfast', label: 'Breakfast' },
  { value: 'lunch', label: 'Lunch' },
  { value: 'dinner', label: 'Dinner' },
  { value: 'others', label: 'Other' },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function humanizeLabel(label) {
  return String(label || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function formatDateLabel(isoDate) {
  if (!isoDate) return '-';
  try {
    return new Date(isoDate).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    });
  } catch {
    return isoDate;
  }
}

function formatScanLogMealType(value) {
  const normalized = normalize(value);
  if (normalized === 'others') return 'Other';
  return normalized ? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}` : 'Any meal';
}

function getScanLogEntryKey(entryOrKey) {
  if (typeof entryOrKey === 'string') return normalize(entryOrKey);
  return normalize(entryOrKey?.scanKey || entryOrKey?.title || entryOrKey?.name || entryOrKey?.label);
}

function mapScanLogEntryToMealPayload(entry, index = 0) {
  const title = entry?.title || entry?.name || entry?.label || `Scan dish ${index + 1}`;
  const mealType = normalize(entry?.mealType) || 'others';
  return {
    id: entry?.id || `scanlog-${normalize(title) || index}`,
    scanKey: normalize(entry?.scanKey || title),
    recipeId: entry?.recipeId || null,
    title,
    name: title,
    image: entry?.image || '/images/meal-mock/placeholder.svg',
    imageSource: entry?.imageSource || 'Scan Log',
    imageAttribution: entry?.imageAttribution || '',
    imageSourceUrl: entry?.imageSourceUrl || '',
    time: entry?.time || 'AI Scan',
    servings: entry?.servings || '1 Serving',
    level: entry?.level || 'Ready',
    mealType,
    source: 'scan_log',
    description: entry?.about || `${title} saved from scan bookmark.`,
    tags: Array.isArray(entry?.tags) ? entry.tags.filter(Boolean) : [],
    nutrition: entry?.nutrition || null,
    savedAt: entry?.savedAt || entry?.updatedAt || '',
  };
}

function Scan() {
  const navigate = useNavigate();
  const [scanMethod, setScanMethod] = useState('image');
  const isImageScan = scanMethod === 'image';
  const [scanLogEntries, setScanLogEntries] = useState(() => readScanLogEntries());
  const [isRefreshingScanLog, setIsRefreshingScanLog] = useState(false);
  const [isScanLogCollapsed, setIsScanLogCollapsed] = useState(false);
  const [editingTagEntryKey, setEditingTagEntryKey] = useState('');

  const syncScanLog = useCallback(() => {
    setScanLogEntries(readScanLogEntries());
  }, []);

  useEffect(() => {
    if (!isImageScan) return undefined;

    syncScanLog();
    window.addEventListener(SCAN_LOG_UPDATED_EVENT, syncScanLog);
    window.addEventListener('storage', syncScanLog);

    return () => {
      window.removeEventListener(SCAN_LOG_UPDATED_EVENT, syncScanLog);
      window.removeEventListener('storage', syncScanLog);
    };
  }, [isImageScan, syncScanLog]);

  useEffect(() => {
    if (!editingTagEntryKey) return undefined;

    function handlePointerDown(event) {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('.scan-log-tag-picker')) return;
      setEditingTagEntryKey('');
    }

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [editingTagEntryKey]);

  const scanLogStats = useMemo(() => {
    const entryCount = scanLogEntries.length;
    const totalCalories = scanLogEntries.reduce((sum, entry) => {
      const calories = Number(entry?.nutrition?.calories);
      return sum + (Number.isFinite(calories) ? Math.max(0, Math.round(calories)) : 0);
    }, 0);
    const avgCalories = entryCount > 0 ? Math.round(totalCalories / entryCount) : 0;
    const cuisines = new Set(
      scanLogEntries
        .map((entry) => String(entry?.cuisine || '').trim().toLowerCase())
        .filter(Boolean),
    );
    const latestSaved = scanLogEntries[0]?.updatedAt || scanLogEntries[0]?.savedAt || '';

    return {
      entryCount,
      avgCalories,
      cuisineCount: cuisines.size,
      latestSaved,
    };
  }, [scanLogEntries]);

  function refreshScanLog() {
    setIsRefreshingScanLog(true);
    syncScanLog();
    window.setTimeout(() => setIsRefreshingScanLog(false), 150);
  }

  function handleDeleteScanLogEntry(entryKey) {
    const nextEntries = removeScanLogEntry(entryKey);
    setScanLogEntries(nextEntries);
    setEditingTagEntryKey('');
  }

  function handleToggleTagPicker(entry) {
    const entryKey = getScanLogEntryKey(entry);
    if (!entryKey) return;
    setEditingTagEntryKey((current) => (current === entryKey ? '' : entryKey));
  }

  function handleChangeScanLogTag(entry, nextMealType) {
    const entryKey = getScanLogEntryKey(entry);
    if (!entryKey) return;

    const nextEntries = updateScanLogEntryMealType(entryKey, nextMealType);
    setScanLogEntries(nextEntries);
    setEditingTagEntryKey('');
  }

  function handleViewDetail(entry, index) {
    const mealPayload = mapScanLogEntryToMealPayload(entry, index);
    try {
      sessionStorage.setItem('selectedMealDetail', JSON.stringify(mealPayload));
    } catch {
      // Ignore storage write issues.
    }
    navigate('/dish/detail', { state: { meal: mealPayload } });
  }

  function handleViewRecipe(entry, index) {
    const mealPayload = mapScanLogEntryToMealPayload(entry, index);
    try {
      sessionStorage.setItem('selectedMealDetail', JSON.stringify(mealPayload));
    } catch {
      // Ignore storage write issues.
    }

    const targetRecipeId = mealPayload.recipeId || mealPayload.id || `scan-${index}`;
    navigate(`/recipe/${encodeURIComponent(String(targetRecipeId))}`, {
      state: { meal: mealPayload },
    });
  }

  return (
    <div className="scan-products-page scan-method-shell">
      <section className="scan-method-card" aria-label="Choose scan method">
        <div className="scan-method-copy">
          <span className="scan-flow-eyebrow">Choose method</span>
          <h1>What do you want to scan?</h1>
          <p>Use food image scan for AI meal recognition, or barcode scan for packaged products.</p>
        </div>

        <div className="scan-method-tabs" role="tablist" aria-label="Scan method">
          <button
            type="button"
            className={`scan-method-option ${isImageScan ? 'active' : ''}`}
            onClick={() => setScanMethod('image')}
            aria-pressed={isImageScan}
          >
            <span>Food image</span>
            <small>AI meal detection</small>
          </button>
          <button
            type="button"
            className={`scan-method-option ${scanMethod === 'barcode' ? 'active' : ''}`}
            onClick={() => setScanMethod('barcode')}
            aria-pressed={scanMethod === 'barcode'}
          >
            <span>Barcode</span>
            <small>Packaged products</small>
          </button>
        </div>
      </section>

      {isImageScan && <ScanProducts embedded />}

      {scanMethod === 'barcode' && <ScanBarcode />}

      <aside className="scan-method-guide">
        <strong>How to use</strong>
        <span>
          {isImageScan
            ? 'Take a clear photo with the full dish visible, then review the AI result before saving it to a meal slot.'
            : 'Type the barcode number exactly as shown on the product package to retrieve product information.'}
        </span>
      </aside>

      {isImageScan ? (
        <>
          <section
            className={`scan-products-container scan-summary-card scan-method-scanlog ${
              isScanLogCollapsed ? 'is-collapsed' : ''
            }`}
          >
            <div className="scan-status-row scan-log-header-row">
              <div className="scan-log-title-group">
                <span className="scan-log-kicker">Reusable scans</span>
                <h2>Scan Bookmark</h2>
              </div>
              <div className="scan-log-header-actions">
                <button
                  type="button"
                  className="scan-log-collapse-btn"
                  onClick={() => setIsScanLogCollapsed((previous) => !previous)}
                  aria-expanded={!isScanLogCollapsed}
                  aria-controls="scan-log-content"
                  title={isScanLogCollapsed ? 'Expand Scan Bookmark' : 'Collapse Scan Bookmark'}
                >
                  <span className="scan-log-collapse-icon" aria-hidden="true">
                    {isScanLogCollapsed ? '▼' : '▲'}
                  </span>
                  <span className="scan-log-collapse-label">
                    {isScanLogCollapsed ? 'Expand' : 'Collapse'}
                  </span>
                </button>
              </div>
            </div>

            <div id="scan-log-content" className="scan-log-content-wrap">
              {isScanLogCollapsed ? (
                <div className="scan-log-collapsed-summary">
                  <span>
                    Avg <strong>{scanLogStats.avgCalories}</strong> kcal
                  </span>
                  <span>
                    <strong>{scanLogStats.cuisineCount}</strong> cuisines
                  </span>
                  <span>
                    Last saved: <strong>{scanLogStats.latestSaved ? formatDateLabel(scanLogStats.latestSaved) : '-'}</strong>
                  </span>
                </div>
              ) : (
                <>
                <div className="scan-result-grid">
                  <div className="scan-stat">
                    <span>Saved dishes</span>
                    <strong>{scanLogStats.entryCount}</strong>
                  </div>
                  <div className="scan-stat">
                    <span>Avg calories</span>
                    <strong>{scanLogStats.avgCalories} kcal</strong>
                  </div>
                  <div className="scan-stat">
                    <span>Cuisines tagged</span>
                    <strong>{scanLogStats.cuisineCount}</strong>
                  </div>
                  <div className="scan-stat">
                    <span>Last saved</span>
                    <strong>{scanLogStats.latestSaved ? formatDateLabel(scanLogStats.latestSaved) : '-'}</strong>
                  </div>
                </div>

                {scanLogEntries.length === 0 ? (
                  <p className="scan-muted">
                    No dishes in Scan Bookmark yet. Click the star next to View detail after scanning to save dishes for reuse.
                  </p>
                ) : (
                  <div className="scan-meal-log-list">
                    {scanLogEntries.map((meal, index) => {
                      const entryKey = getScanLogEntryKey(meal);
                      const isTagPickerOpen = Boolean(entryKey && editingTagEntryKey === entryKey);
                      const mealTypeLabel = formatScanLogMealType(meal?.mealType);
                      const cuisineLabel = meal?.cuisine ? humanizeLabel(meal.cuisine) : '';

                      return (
                      <div key={meal.id || meal.scanKey} className="scan-meal-log-item">
                        <div className="scan-log-item-main">
                          <div className="scan-log-item-title">{meal.title || humanizeLabel(meal.label)}</div>
                          <div className="scan-log-item-meta">
                            <p>{meal?.nutrition?.calories ?? '?'} kcal</p>
                            {cuisineLabel ? <span className="scan-log-cuisine-chip">{cuisineLabel}</span> : null}
                          </div>
                        </div>
                        <div className="scan-log-item-actions">
                          <div className="scan-log-tag-picker">
                            <button
                              type="button"
                              className={`scan-log-tag-trigger ${isTagPickerOpen ? 'active' : ''}`}
                              onClick={() => handleToggleTagPicker(meal)}
                            >
                              {mealTypeLabel}
                              <span aria-hidden="true">▾</span>
                            </button>

                            {isTagPickerOpen ? (
                              <div className="scan-log-tag-menu" role="menu" aria-label="Change bookmark tag">
                                {BOOKMARK_TAG_OPTIONS.map((option) => (
                                  <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemradio"
                                    aria-checked={normalize(meal?.mealType) === option.value}
                                    className={`scan-log-tag-option ${
                                      normalize(meal?.mealType) === option.value ? 'active' : ''
                                    }`}
                                    onClick={() => handleChangeScanLogTag(meal, option.value)}
                                  >
                                    {option.label}
                                  </button>
                                ))}
                              </div>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            className="scan-log-action-btn scan-log-detail-btn"
                            onClick={() => handleViewDetail(meal, index)}
                          >
                            Detail
                          </button>
                          <button
                            type="button"
                            className="scan-log-action-btn scan-log-recipe-btn"
                            onClick={() => handleViewRecipe(meal, index)}
                          >
                            Recipe
                          </button>
                          <button
                            type="button"
                            className="scan-delete-btn scan-log-delete-btn"
                            onClick={() => handleDeleteScanLogEntry(entryKey)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )})}
                  </div>
                )}
                </>
              )}
            </div>
          </section>

          {!isScanLogCollapsed ? (
            <button className="view-history-button scan-method-scanlog-refresh" onClick={refreshScanLog}>
              {isRefreshingScanLog ? 'Refreshing...' : 'Refresh Scan Bookmark'}
            </button>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

export default Scan;
