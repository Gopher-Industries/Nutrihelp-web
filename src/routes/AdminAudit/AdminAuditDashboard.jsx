import React, { useEffect, useMemo, useState } from "react";
import adminAuditApi from "../../services/adminAuditApi";
import "./AdminAuditDashboard.css";

const FALLBACK_REFRESH_MS = 30000;

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch (_error) {
    return String(value);
  }
}

function StatusPill({ value }) {
  const normalized = String(value || "unknown").toLowerCase();
  const label = normalized.replace(/-/g, " ");
  return <span className={`admin-audit-pill admin-audit-pill-${normalized}`}>{label}</span>;
}

function getRepositoryStatus(repo) {
  if (repo?.status) return String(repo.status).toLowerCase();
  if (!repo?.available) return "not-loaded";

  if (repo?.key === "mobile") return "code-only";
  if (repo?.key === "ai") return "not-running";
  if (repo?.key === "api") return "running";
  if (repo?.key === "web") return "code-only";

  return "unknown";
}

function formatRepoStatusHint(repo) {
  if (!repo) return "—";

  const parts = [];
  const normalizedStatus = getRepositoryStatus(repo);

  if (repo.note) {
    parts.push(repo.note);
  } else if (normalizedStatus === "not-loaded") {
    parts.push("Repository is not present in the current workspace.");
  } else if (normalizedStatus === "not-running") {
    parts.push("Source is present, but no responding local runtime was detected.");
  } else if (normalizedStatus === "code-only") {
    parts.push("Source is available for audit, but this tool has not detected a live runtime.");
  } else if (normalizedStatus === "running") {
    parts.push("Repository source is available and the expected local runtime is responding.");
  }

  if (repo.runtimeUrl) {
    parts.push(
      repo.runtimeReachable === true
        ? `Runtime reachable at ${repo.runtimeUrl}`
        : `Expected runtime: ${repo.runtimeUrl}`
    );
  }

  return parts.join(" ");
}

function SummaryCard({ label, value, hint }) {
  return (
    <article className="admin-audit-card">
      <span className="admin-audit-card-label">{label}</span>
      <strong className="admin-audit-card-value">{value}</strong>
      {hint ? <span className="admin-audit-card-hint">{hint}</span> : null}
    </article>
  );
}

function buildRouteKey(route) {
  return `${route.frontendRoute}::${route.componentName}`;
}

function LayerStatusCard({ label, layer }) {
  if (!layer) return null;

  return (
    <div className="admin-audit-layer-card">
      <div className="admin-audit-layer-card-head">
        <strong>{label}</strong>
        <StatusPill value={layer.status || "unknown"} />
      </div>
      {layer.issues?.length ? (
        <ul className="admin-audit-layer-issues">
          {layer.issues.map((issue) => (
            <li key={`${label}-${issue}`}>{issue}</li>
          ))}
        </ul>
      ) : (
        <div className="admin-audit-muted">No active issues detected for this layer.</div>
      )}
    </div>
  );
}

function ClassificationTags({ values = [] }) {
  if (!values.length) {
    return <span className="admin-audit-muted">No extra classifications.</span>;
  }

  return (
    <div className="admin-audit-flow-tags">
      {values.map((value) => (
        <StatusPill key={value} value={value} />
      ))}
    </div>
  );
}

function ContractValidationCard({ entry }) {
  if (!entry) return null;

  return (
    <div className="admin-audit-layer-card">
      <div className="admin-audit-layer-card-head">
        <strong>{entry.endpoint}</strong>
        <StatusPill value={entry.status || "unknown"} />
      </div>
      <div className="admin-audit-muted">Required: {entry.requiredFields?.length ? entry.requiredFields.join(", ") : "—"}</div>
      <div className="admin-audit-muted">
        Missing: {entry.missingFields?.length ? entry.missingFields.join(", ") : "None"}
      </div>
      <div className="admin-audit-muted">
        Optional missing: {entry.optionalMissingFields?.length ? entry.optionalMissingFields.join(", ") : "None"}
      </div>
      <div className="admin-audit-muted">
        Aliases detected: {entry.detectedAliases?.length ? entry.detectedAliases.join(", ") : "None"}
      </div>
      {entry.renamedFields?.length ? (
        <ul className="admin-audit-layer-issues">
          {entry.renamedFields.map((item) => (
            <li key={`${entry.endpoint}-${item.expectedField}`}>
              Expected <code>{item.expectedField}</code> but found alias {item.detectedAliases.join(", ")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function DataQualityCard({ entry }) {
  if (!entry) return null;

  return (
    <div className="admin-audit-layer-card">
      <div className="admin-audit-layer-card-head">
        <strong>{entry.endpoint}</strong>
        <StatusPill value={entry.status || "unknown"} />
      </div>
      <div className="admin-audit-muted">Captured: {formatDateTime(entry.capturedAt)}</div>
      <div className="admin-audit-muted">
        Missing values: {entry.missingValues?.length ? entry.missingValues.join(", ") : "None"}
      </div>
      <div className="admin-audit-muted">
        Empty arrays: {entry.emptyArrays?.length ? entry.emptyArrays.join(", ") : "None"}
      </div>
      <div className="admin-audit-muted">
        Blank strings: {entry.blankStrings?.length ? entry.blankStrings.join(", ") : "None"}
      </div>
      {entry.notes?.length ? (
        <ul className="admin-audit-layer-issues">
          {entry.notes.map((note) => (
            <li key={`${entry.endpoint}-${note}`}>{note}</li>
          ))}
        </ul>
      ) : null}
      {entry.sampleBody ? (
        <pre className="admin-audit-sample-preview">
          {JSON.stringify(entry.sampleBody, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

const AdminAuditDashboard = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [repositoryFilter, setRepositoryFilter] = useState("all");
  const [selectedRouteKey, setSelectedRouteKey] = useState("");

  useEffect(() => {
    let cancelled = false;
    let intervalId = null;

    const load = async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      if (!silent) {
        setError("");
      }

      try {
        const data = await adminAuditApi.getLiveOverview();
        if (!cancelled) {
          setOverview(data);
        }
      } catch (loadError) {
        if (!cancelled && !silent) {
          const details = [
            loadError.message || "Failed to load admin audit overview",
            "Expected API: http://127.0.0.1:8081/api/system/dev/live-audit/overview",
          ].join(" ");
          setError(details);
        }
      } finally {
        if (!cancelled) {
          if (!silent) {
            setLoading(false);
          } else {
            setRefreshing(false);
          }
        }
      }
    };

    load();

    const refreshIntervalMs =
      overview?.live?.refreshIntervalMs || FALLBACK_REFRESH_MS;

    intervalId = window.setInterval(() => {
      load({ silent: true });
    }, refreshIntervalMs);

    return () => {
      cancelled = true;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [overview?.live?.refreshIntervalMs]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const data = await adminAuditApi.refreshLiveOverview();
      setOverview(data);
    } catch (refreshError) {
      setError(refreshError.message || "Failed to refresh live audit overview");
    } finally {
      setRefreshing(false);
    }
  };

  const repositorySummary = useMemo(() => overview?.repositories || [], [overview]);
  const filteredRepositorySummary = useMemo(() => {
    if (repositoryFilter !== "attention") return repositorySummary;
    return repositorySummary.filter(
      (repo) => {
        const status = getRepositoryStatus(repo);
        return status === "not-loaded" || status === "not-running";
      }
    );
  }, [repositoryFilter, repositorySummary]);
  const routeAudit = useMemo(() => overview?.routeAudit || [], [overview]);
  const selectedRoute = useMemo(
    () => routeAudit.find((route) => buildRouteKey(route) === selectedRouteKey) || routeAudit[0] || null,
    [routeAudit, selectedRouteKey]
  );
  const recentErrors = useMemo(() => overview?.recentErrors || [], [overview]);
  const unusedBackendRoutes = useMemo(() => overview?.unusedRoutes?.backend || [], [overview]);
  const emptyFrontendRoutes = useMemo(() => overview?.unusedRoutes?.frontend || [], [overview]);
  const aiServices = useMemo(() => Object.values(overview?.health?.aiServices || {}), [overview]);

  useEffect(() => {
    if (!routeAudit.length) {
      if (selectedRouteKey) setSelectedRouteKey("");
      return;
    }

    if (!selectedRouteKey || !routeAudit.some((route) => buildRouteKey(route) === selectedRouteKey)) {
      setSelectedRouteKey(buildRouteKey(routeAudit[0]));
    }
  }, [routeAudit, selectedRouteKey]);

  return (
    <main className="admin-audit-shell">
      <section className="admin-audit-hero">
        <div>
          <p className="admin-audit-kicker">Internal Tool</p>
          <h1>Integration Audit Dashboard</h1>
          <p className="admin-audit-subtitle">
            Internal visibility across frontend routes, backend endpoints, AI service usage, and recent failures.
          </p>
        </div>
        <div className="admin-audit-meta">
          <span>Generated</span>
          <strong>{formatDateTime(overview?.generatedAt)}</strong>
          <div className="admin-audit-meta-live">
            <StatusPill value={overview?.live?.mode || "live"} />
            <span>Last checked {formatDateTime(overview?.live?.lastRunAt || overview?.generatedAt)}</span>
          </div>
          <div className="admin-audit-meta-live">
            <span>Refresh every {(overview?.live?.refreshIntervalMs || FALLBACK_REFRESH_MS) / 1000}s</span>
            <button
              type="button"
              className="admin-audit-refresh-button"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              {refreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>
          {overview?.__debug?.endpoint ? (
            <div className="admin-audit-meta-debug">{overview.__debug.endpoint}</div>
          ) : null}
        </div>
      </section>

      {loading ? <div className="admin-audit-state">Loading live dashboard…</div> : null}
      {error ? <div className="admin-audit-state admin-audit-state-error">{error}</div> : null}

      {!loading && !error && overview ? (
        <>
          <section className="admin-audit-summary-grid">
            <SummaryCard label="Frontend Routes" value={overview.summary.totalFrontendRoutes} />
            <SummaryCard label="Backend Endpoints" value={overview.summary.totalBackendRoutes} />
            <SummaryCard label="Connected Routes" value={overview.summary.connectedRoutes} />
            <SummaryCard label="Direct AI Routes" value={overview.summary.directAiRoutes} hint={`Requires auth: ${overview.summary.requiresAuthRoutes}`} />
            <SummaryCard label="Degraded Routes" value={overview.summary.degradedRoutes} hint={`Contract mismatch: ${overview.summary.contractMismatchRoutes}`} />
            <SummaryCard label="Bad Data Routes" value={overview.summary.badDataRoutes} hint="Captured runtime samples with missing or empty payload fields" />
            <SummaryCard label="Chatbot API Requests" value={overview.summary.chatbotRequests} hint={`AI calls: ${overview.summary.chatbotAiCalls}`} />
            <SummaryCard label="Recent Errors" value={overview.summary.recentErrorCount} />
            <SummaryCard label="Unused Backend Routes" value={overview.summary.unusedBackendRoutes} hint={`Empty frontend routes: ${overview.summary.emptyFrontendRoutes}`} />
            <SummaryCard label="Repos Running" value={overview.summary.repositoriesRunning} hint={`Code only: ${overview.summary.repositoriesCodeOnly}`} />
            <SummaryCard label="Repos Attention Needed" value={overview.summary.repositoriesNotLoaded + overview.summary.repositoriesNotRunning} hint={`Not loaded: ${overview.summary.repositoriesNotLoaded} • Not running: ${overview.summary.repositoriesNotRunning} • Stale routes: ${overview.summary.staleRoutes}`} />
          </section>

          <section className="admin-audit-panels">
            <article className="admin-audit-panel">
              <div className="admin-audit-panel-header">
                <h2>Repository Status</h2>
                <div className="admin-audit-filter-group">
                  <button
                    type="button"
                    className={`admin-audit-filter-button ${repositoryFilter === "all" ? "is-active" : ""}`}
                    onClick={() => setRepositoryFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`admin-audit-filter-button ${repositoryFilter === "attention" ? "is-active" : ""}`}
                    onClick={() => setRepositoryFilter("attention")}
                  >
                    Attention only
                  </button>
                </div>
              </div>
              <div className="admin-audit-list">
                {filteredRepositorySummary.length === 0 ? (
                  <div className="admin-audit-muted">No repositories match the current filter.</div>
                ) : filteredRepositorySummary.map((repo) => (
                  <div key={repo.key} className="admin-audit-list-row">
                    <div>
                      <strong>{repo.name}</strong>
                      <div className="admin-audit-muted">{repo.path || "Repository not found in current workspace"}</div>
                      <div className="admin-audit-repo-note">{formatRepoStatusHint(repo)}</div>
                    </div>
                    <StatusPill value={getRepositoryStatus(repo)} />
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-audit-panel">
              <h2>Service Health</h2>
              <div className="admin-audit-stack">
                <div className="admin-audit-health-block">
                  <strong>API Runtime</strong>
                  <div className="admin-audit-muted">Started: {formatDateTime(overview.health.api.requestAuditStartedAt)}</div>
                  <div className="admin-audit-muted">Tracked requests: {overview.health.api.runtimeRequestCount}</div>
                </div>
                <div className="admin-audit-health-block">
                  <strong>Error Logging</strong>
                  <div className="admin-audit-muted">Overall: {String(overview.health.errorLogging?.overall)}</div>
                  <div className="admin-audit-muted">Database: {String(overview.health.errorLogging?.database)}</div>
                  <div className="admin-audit-muted">File: {String(overview.health.errorLogging?.file)}</div>
                </div>
                <div className="admin-audit-health-block">
                  <strong>AI Services</strong>
                  {aiServices.length === 0 ? (
                    <div className="admin-audit-muted">No AI traffic recorded since process start.</div>
                  ) : (
                    aiServices.map((service) => (
                      <div key={service.service} className="admin-audit-ai-row">
                        <span>{service.service}</span>
                        <span>{service.calls} calls</span>
                        <span>{service.successRate} success</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </article>
          </section>

          <section className="admin-audit-panels">
            <article className="admin-audit-panel">
              <h2>Recent Errors</h2>
              <div className="admin-audit-list">
                {recentErrors.length === 0 ? (
                  <div className="admin-audit-muted">No recent error logs found.</div>
                ) : (
                  recentErrors.map((entry, index) => (
                    <div key={`${entry.timestamp || entry.at || "error"}-${index}`} className="admin-audit-error-row">
                      <div className="admin-audit-error-head">
                        <strong>{entry.message || entry.error_message || "Unknown error"}</strong>
                        <span>{formatDateTime(entry.timestamp || entry.created_at || entry.at)}</span>
                      </div>
                      <div className="admin-audit-muted">
                        <StatusPill value={entry.layer || "unknown"} /> {entry.category || entry.type || "unknown"} {entry.code ? `• ${entry.code}` : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="admin-audit-panel">
              <h2>Unused or Empty Routes</h2>
              <div className="admin-audit-stack">
                <div>
                  <strong>Empty Frontend Routes</strong>
                  <ul className="admin-audit-mini-list">
                    {emptyFrontendRoutes.length === 0 ? <li>None</li> : emptyFrontendRoutes.map((route) => <li key={route.frontendRoute}>{route.frontendRoute}</li>)}
                  </ul>
                </div>
                <div>
                  <strong>Unused Backend Routes</strong>
                  <ul className="admin-audit-mini-list">
                    {unusedBackendRoutes.length === 0 ? <li>None</li> : unusedBackendRoutes.slice(0, 12).map((route) => <li key={route.mountPath}>{route.mountPath}</li>)}
                  </ul>
                </div>
              </div>
            </article>
          </section>

          {selectedRoute ? (
            <section className="admin-audit-panel admin-audit-detail-panel">
              <div className="admin-audit-panel-header">
                <div>
                  <h2>Route Flow Detail</h2>
                  <div className="admin-audit-muted">
                    {selectedRoute.frontendRoute} • {selectedRoute.componentFile || selectedRoute.componentName}
                  </div>
                </div>
                <div className="admin-audit-detail-statuses">
                  <StatusPill value={selectedRoute.status} />
                  <span className="admin-audit-muted">
                    API activity {selectedRoute.activity?.totalApiRequests || 0} • AI calls {selectedRoute.activity?.totalAiCalls || 0}
                  </span>
                </div>
              </div>

              <div className="admin-audit-flow-grid">
                <div className="admin-audit-flow-column">
                  <span className="admin-audit-flow-label">Frontend</span>
                  <strong>{selectedRoute.componentName}</strong>
                  <div className="admin-audit-muted">{selectedRoute.componentFile || "Component file unavailable"}</div>
                  <div className="admin-audit-flow-tags">
                    <span className="admin-audit-flow-tag">{selectedRoute.frontendRoute}</span>
                  </div>
                </div>

                <div className="admin-audit-flow-column">
                  <span className="admin-audit-flow-label">API</span>
                  {selectedRoute.flow?.api?.length ? (
                    selectedRoute.flow.api.map((entry) => (
                      <div key={entry.endpoint} className="admin-audit-flow-block">
                        <div className="admin-audit-flow-head">
                          <strong>{entry.endpoint}</strong>
                          <StatusPill value={entry.status} />
                        </div>
                        <div className="admin-audit-muted">
                          {entry.group} • {entry.moduleFile || "No module file"}
                        </div>
                        <div className="admin-audit-muted">
                          Requests: {entry.requestStats?.total || 0} • Last status: {entry.requestStats?.lastStatusCode || "—"} • Last seen: {formatDateTime(entry.requestStats?.lastCalledAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-audit-muted">No backend hop detected for this route.</div>
                  )}
                </div>

                <div className="admin-audit-flow-column">
                  <span className="admin-audit-flow-label">AI</span>
                  {selectedRoute.flow?.ai?.length ? (
                    selectedRoute.flow.ai.map((entry) => (
                      <div key={entry.endpoint} className="admin-audit-flow-block">
                        <div className="admin-audit-flow-head">
                          <strong>{entry.endpoint}</strong>
                          <StatusPill value={entry.status} />
                        </div>
                        <div className="admin-audit-muted">
                          Services: {entry.services?.length ? entry.services.join(", ") : "No monitor match yet"}
                        </div>
                        <div className="admin-audit-muted">
                          Calls: {entry.totalCalls || 0} • Failures: {entry.failures || 0} • Last failure: {formatDateTime(entry.lastFailureAt)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="admin-audit-muted">No AI hop detected for this route.</div>
                  )}
                </div>
              </div>

              <div className="admin-audit-layer-grid">
                <LayerStatusCard label="Frontend Layer" layer={selectedRoute.layerHealth?.frontend} />
                <LayerStatusCard label="API Layer" layer={selectedRoute.layerHealth?.api} />
                <LayerStatusCard label="AI Layer" layer={selectedRoute.layerHealth?.ai} />
              </div>

              <div className="admin-audit-layer-card">
                <div className="admin-audit-layer-card-head">
                  <strong>Classifications</strong>
                  <StatusPill value={selectedRoute.authMode || "public"} />
                </div>
                <ClassificationTags values={selectedRoute.classifications || []} />
              </div>

              <div className="admin-audit-contract-grid">
                <div className="admin-audit-panel-header">
                  <strong>Contract Validation</strong>
                  <span>{selectedRoute.contractValidation?.backend?.length || 0} backend contract checks</span>
                </div>
                {selectedRoute.contractValidation?.backend?.length ? (
                  <div className="admin-audit-layer-grid">
                    {selectedRoute.contractValidation.backend.map((entry) => (
                      <ContractValidationCard key={entry.endpoint} entry={entry} />
                    ))}
                  </div>
                ) : (
                  <div className="admin-audit-muted">No backend contract checks apply to this route.</div>
                )}
              </div>

              <div className="admin-audit-contract-grid">
                <div className="admin-audit-panel-header">
                  <strong>Runtime Data Quality</strong>
                  <span>{selectedRoute.flow?.api?.length || 0} sampled endpoint checks</span>
                </div>
                {selectedRoute.flow?.api?.length ? (
                  <div className="admin-audit-layer-grid">
                    {selectedRoute.flow.api.map((entry) => (
                      <DataQualityCard key={`${entry.endpoint}-data-quality`} entry={entry.dataQuality} />
                    ))}
                  </div>
                ) : (
                  <div className="admin-audit-muted">No backend data samples apply to this route yet.</div>
                )}
              </div>

              <div className="admin-audit-related-failures">
                <div className="admin-audit-panel-header">
                  <strong>Related Failures</strong>
                  <span>{selectedRoute.relatedFailures?.length || 0} linked signals</span>
                </div>
                {selectedRoute.relatedFailures?.length ? (
                  <div className="admin-audit-list">
                    {selectedRoute.relatedFailures.map((entry, index) => (
                      <div key={`${entry.layer}-${entry.message}-${index}`} className="admin-audit-error-row">
                        <div className="admin-audit-error-head">
                          <strong>{entry.message}</strong>
                          <span>{formatDateTime(entry.at)}</span>
                        </div>
                        <div className="admin-audit-muted">
                          <StatusPill value={entry.layer} /> <StatusPill value={entry.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="admin-audit-muted">No route-specific failures are linked in the current snapshot.</div>
                )}
              </div>
            </section>
          ) : null}

          <section className="admin-audit-panel">
            <div className="admin-audit-panel-header">
              <h2>Route Audit Table</h2>
              <span>{routeAudit.length} frontend routes scanned</span>
            </div>
            <div className="admin-audit-table-wrap">
              <table className="admin-audit-table">
                <thead>
                  <tr>
                    <th>Frontend Route</th>
                    <th>Component File</th>
                    <th>Backend APIs</th>
                    <th>AI Services</th>
                    <th>Status</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {routeAudit.map((row) => (
                    <tr
                      key={`${row.frontendRoute}-${row.componentName}`}
                      className={buildRouteKey(row) === buildRouteKey(selectedRoute || {}) ? "is-selected" : ""}
                      onClick={() => setSelectedRouteKey(buildRouteKey(row))}
                    >
                      <td>{row.frontendRoute}</td>
                      <td>{row.componentFile || row.componentName}</td>
                      <td>
                        {row.backendApis.length === 0 ? "—" : row.backendApis.join(", ")}
                      </td>
                      <td>
                        {row.aiServices.length === 0 ? "—" : row.aiServices.join(", ")}
                      </td>
                      <td><StatusPill value={row.status} /></td>
                      <td>
                        {row.notes || "—"}
                        <div className="admin-audit-row-layer-pills">
                          <StatusPill value={row.layerHealth?.frontend?.status || "unknown"} />
                          <StatusPill value={row.layerHealth?.api?.status || "not-applicable"} />
                          <StatusPill value={row.layerHealth?.ai?.status || "not-applicable"} />
                        </div>
                        <div className="admin-audit-row-layer-pills">
                          {(row.classifications || []).map((value) => (
                            <StatusPill key={`${row.frontendRoute}-${value}`} value={value} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
};

export default AdminAuditDashboard;
