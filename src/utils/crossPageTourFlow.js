const CROSS_PAGE_TOUR_FLOW_STORAGE_KEY = "nutrihelp_cross_page_tour_flow_v1";

export function readCrossPageTourFlow() {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(CROSS_PAGE_TOUR_FLOW_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function writeCrossPageTourFlow(nextFlowState) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(CROSS_PAGE_TOUR_FLOW_STORAGE_KEY, JSON.stringify(nextFlowState));
  } catch {
    // Ignore sessionStorage write failures in restricted environments.
  }
}

export function clearCrossPageTourFlow() {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(CROSS_PAGE_TOUR_FLOW_STORAGE_KEY);
  } catch {
    // Ignore sessionStorage write failures in restricted environments.
  }
}

export function setCrossPageTourFlowStage(flowId, stage, extras = {}) {
  if (!flowId || !stage) return;

  writeCrossPageTourFlow({
    flowId,
    stage,
    ...extras,
    updatedAt: Date.now(),
  });
}
