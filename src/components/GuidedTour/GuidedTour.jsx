import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MousePointerClick } from "lucide-react";
import "./GuidedTour.css";

const VIEWPORT_MARGIN = 12;
const DEFAULT_SPOTLIGHT_PADDING = 16;
const DEFAULT_SPOTLIGHT_MIN_SIZE = 84;
const DEFAULT_SPOTLIGHT_MAX_SIZE = 260;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function safeNumeric(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toSelectorCandidates(step) {
  if (!step) return [];

  const selectors = [];
  if (Array.isArray(step.targetSelectors)) {
    step.targetSelectors.forEach((selector) => {
      if (typeof selector === "string" && selector.trim()) selectors.push(selector.trim());
    });
  }

  if (typeof step.targetSelector === "string" && step.targetSelector.trim()) {
    selectors.push(step.targetSelector.trim());
  }

  const targetIds = [];
  if (Array.isArray(step.targetIds)) {
    step.targetIds.forEach((targetId) => {
      if (typeof targetId === "string" && targetId.trim()) targetIds.push(targetId.trim());
    });
  } else if (typeof step.targetId === "string" && step.targetId.trim()) {
    targetIds.push(step.targetId.trim());
  }

  targetIds.forEach((targetId) => {
    const escaped = targetId.replace(/"/g, '\\"');
    selectors.push(`[data-tour-id="${escaped}"]`);
  });

  return selectors;
}

function resolveTargetElement(step) {
  if (typeof document === "undefined") return null;

  const selectors = toSelectorCandidates(step);
  for (const selector of selectors) {
    try {
      const element = document.querySelector(selector);
      if (element) return element;
    } catch {
      // Ignore invalid selector and keep resolving the rest.
    }
  }

  return null;
}

function computeSpotlight(targetRect, step, viewport) {
  if (!targetRect || !viewport?.width || !viewport?.height) return null;

  const minSize = safeNumeric(step?.spotlightMinSize, DEFAULT_SPOTLIGHT_MIN_SIZE);
  const maxSize = safeNumeric(step?.spotlightMaxSize, DEFAULT_SPOTLIGHT_MAX_SIZE);
  const padding = safeNumeric(step?.spotlightPadding, DEFAULT_SPOTLIGHT_PADDING);
  const explicitSize = safeNumeric(step?.spotlightSize, 0);
  const baseSize = explicitSize > 0
    ? explicitSize
    : Math.max(targetRect.width, targetRect.height) + padding * 2;

  const maxViewportSize = Math.max(
    64,
    Math.min(viewport.width, viewport.height) - VIEWPORT_MARGIN * 2,
  );

  const diameter = clamp(baseSize, minSize, Math.min(maxSize, maxViewportSize));

  const centerX = targetRect.left + targetRect.width / 2;
  const centerY = targetRect.top + targetRect.height / 2;
  const left = clamp(centerX - diameter / 2, VIEWPORT_MARGIN, viewport.width - diameter - VIEWPORT_MARGIN);
  const top = clamp(centerY - diameter / 2, VIEWPORT_MARGIN, viewport.height - diameter - VIEWPORT_MARGIN);

  const pointerLeft = clamp(left + diameter - 16, VIEWPORT_MARGIN, viewport.width - 44);
  const pointerTop = clamp(top + diameter * 0.15, VIEWPORT_MARGIN, viewport.height - 44);

  return {
    diameter,
    left,
    top,
    pointerLeft,
    pointerTop,
  };
}

export default function GuidedTour({
  open,
  steps,
  restartKey = 0,
  onFinish,
  onSkip,
}) {
  const safeSteps = Array.isArray(steps) ? steps : [];
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const targetObserverRef = useRef(null);

  const currentStep = safeSteps[stepIndex] || null;
  const isLastStep = stepIndex === safeSteps.length - 1;

  const updateTargetRect = useCallback(() => {
    if (!open || !currentStep || typeof window === "undefined") return;

    const targetElement = resolveTargetElement(currentStep);
    if (!targetElement) {
      setTargetRect(null);
      return;
    }

    const nextRect = targetElement.getBoundingClientRect();
    if (nextRect.width <= 0 || nextRect.height <= 0) {
      setTargetRect(null);
      return;
    }

    setTargetRect(nextRect);
  }, [currentStep, open]);

  useEffect(() => {
    if (!open) return;

    setStepIndex(0);
  }, [open, restartKey]);

  useEffect(() => {
    if (!open || !currentStep) return;

    const targetElement = resolveTargetElement(currentStep);
    if (targetElement && currentStep.scrollIntoView !== false) {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: currentStep.scrollBlock || "center",
        inline: currentStep.scrollInline || "center",
      });
    }

    const timer = window.setTimeout(() => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      updateTargetRect();
    }, 220);

    return () => window.clearTimeout(timer);
  }, [currentStep, open, updateTargetRect]);

  useEffect(() => {
    if (!open || !currentStep || typeof window === "undefined") return;

    const syncLayout = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
      updateTargetRect();
    };

    syncLayout();

    const targetElement = resolveTargetElement(currentStep);
    if (targetObserverRef.current) {
      targetObserverRef.current.disconnect();
      targetObserverRef.current = null;
    }

    if (targetElement && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(() => {
        updateTargetRect();
      });
      observer.observe(targetElement);
      targetObserverRef.current = observer;
    }

    window.addEventListener("resize", syncLayout);
    window.addEventListener("scroll", updateTargetRect, true);

    return () => {
      window.removeEventListener("resize", syncLayout);
      window.removeEventListener("scroll", updateTargetRect, true);
      if (targetObserverRef.current) {
        targetObserverRef.current.disconnect();
        targetObserverRef.current = null;
      }
    };
  }, [currentStep, open, updateTargetRect]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onSkip?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onSkip]);

  const spotlight = useMemo(
    () => computeSpotlight(targetRect, currentStep, viewport),
    [currentStep, targetRect, viewport],
  );

  if (!open || !currentStep || safeSteps.length === 0 || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div className="guided-tour-overlay" role="dialog" aria-modal="true" aria-label="Add Meal Guide">
      <div className="guided-tour-backdrop" />

      {spotlight ? (
        <>
          <div
            className="guided-tour-spotlight"
            style={{
              width: `${spotlight.diameter}px`,
              height: `${spotlight.diameter}px`,
              left: `${spotlight.left}px`,
              top: `${spotlight.top}px`,
            }}
            aria-hidden="true"
          />
          <div
            className="guided-tour-pointer"
            style={{
              left: `${spotlight.pointerLeft}px`,
              top: `${spotlight.pointerTop}px`,
            }}
            aria-hidden="true"
          >
            <MousePointerClick size={24} strokeWidth={2.2} />
          </div>
        </>
      ) : null}

      <div className="guided-tour-panel">
        <span className="guided-tour-step-label">Step {stepIndex + 1} of {safeSteps.length}</span>
        <h2>{currentStep.title}</h2>
        <p>{currentStep.description}</p>

        <div className="guided-tour-actions">
          <button
            type="button"
            className="guided-tour-btn guided-tour-btn-secondary"
            onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={stepIndex === 0}
          >
            Back
          </button>

          <button
            type="button"
            className="guided-tour-btn guided-tour-btn-secondary"
            onClick={() => onSkip?.()}
          >
            Skip
          </button>

          {isLastStep ? (
            <button
              type="button"
              className="guided-tour-btn guided-tour-btn-primary"
              onClick={() => onFinish?.()}
            >
              Finish
            </button>
          ) : (
            <button
              type="button"
              className="guided-tour-btn guided-tour-btn-primary"
              onClick={() => setStepIndex((prev) => Math.min(safeSteps.length - 1, prev + 1))}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
