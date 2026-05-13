import React, { useEffect, useMemo, useReducer, useRef } from "react";
import { CheckCircle2, Circle, Eye, EyeOff, X } from "lucide-react";
import {
  PASSWORD_RULES,
  getPasswordChecklist,
  isPasswordStrong,
  mapPasswordApiError,
  validateUpdateStep,
  validateVerifyStep,
} from "./changePasswordValidation";
import { changePasswordApi } from "./changePasswordApi";
import "./ChangePasswordModal.css";

const FLOW_STEP = {
  VERIFY: "verify",
  UPDATE: "update",
  SUCCESS: "success",
};

const FLOW_STATUS = {
  DEFAULT: "default",
  FOCUS: "focus",
  TYPING: "typing",
  VALIDATION_ERROR: "validation_error",
  API_ERROR: "api_error",
  LOADING: "loading",
  SUCCESS: "success",
  RATE_LIMITED: "rate_limited",
};

const createInitialState = () => ({
  step: FLOW_STEP.VERIFY,
  flowStatus: FLOW_STATUS.DEFAULT,
  isLoading: false,
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  showCurrentPassword: false,
  showNewPassword: false,
  showConfirmPassword: false,
  fieldErrors: {
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  },
  fieldStates: {
    currentPassword: FLOW_STATUS.DEFAULT,
    newPassword: FLOW_STATUS.DEFAULT,
    confirmPassword: FLOW_STATUS.DEFAULT,
  },
  formError: "",
  retryGuidance: "",
});

const applyErrorStates = (state, fieldErrors, fallbackState) => {
  const next = { ...state.fieldStates };

  Object.keys(next).forEach((field) => {
    next[field] = fieldErrors[field] ? fallbackState : state.fieldStates[field];
  });

  return next;
};

const reducer = (state, action) => {
  switch (action.type) {
    case "RESET":
      return createInitialState();

    case "FIELD_FOCUS": {
      if (state.isLoading) return state;
      const nextFieldStates = {
        ...state.fieldStates,
        [action.field]: FLOW_STATUS.FOCUS,
      };
      return {
        ...state,
        fieldStates: nextFieldStates,
        flowStatus: FLOW_STATUS.FOCUS,
      };
    }

    case "FIELD_BLUR": {
      const value = state[action.field] || "";
      if (value || state.fieldErrors[action.field]) return state;

      return {
        ...state,
        fieldStates: {
          ...state.fieldStates,
          [action.field]: FLOW_STATUS.DEFAULT,
        },
      };
    }

    case "FIELD_CHANGE": {
      return {
        ...state,
        [action.field]: action.value,
        flowStatus: FLOW_STATUS.TYPING,
        fieldErrors: {
          ...state.fieldErrors,
          [action.field]: "",
        },
        fieldStates: {
          ...state.fieldStates,
          [action.field]: FLOW_STATUS.TYPING,
        },
        formError: "",
        retryGuidance: "",
      };
    }

    case "TOGGLE_VISIBILITY": {
      return {
        ...state,
        [action.field]: !state[action.field],
      };
    }

    case "VERIFY_VALIDATION_ERROR": {
      return {
        ...state,
        isLoading: false,
        flowStatus: FLOW_STATUS.VALIDATION_ERROR,
        fieldErrors: {
          ...state.fieldErrors,
          ...action.fieldErrors,
        },
        fieldStates: applyErrorStates(
          state,
          action.fieldErrors,
          FLOW_STATUS.VALIDATION_ERROR
        ),
        formError: action.formError || "",
        retryGuidance: action.retryGuidance || "",
      };
    }

    case "VERIFY_REQUEST": {
      return {
        ...state,
        isLoading: true,
        flowStatus: FLOW_STATUS.LOADING,
        fieldErrors: {
          ...state.fieldErrors,
          currentPassword: "",
        },
        fieldStates: {
          ...state.fieldStates,
          currentPassword: FLOW_STATUS.LOADING,
        },
        formError: "",
        retryGuidance: "",
      };
    }

    case "VERIFY_FAILURE": {
      const flowStatus = action.flowStatus || FLOW_STATUS.API_ERROR;
      return {
        ...state,
        isLoading: false,
        flowStatus,
        fieldErrors: {
          ...state.fieldErrors,
          ...action.fieldErrors,
        },
        fieldStates: {
          ...state.fieldStates,
          currentPassword: action.fieldErrors?.currentPassword
            ? flowStatus
            : state.fieldStates.currentPassword,
        },
        formError: action.formError || "",
        retryGuidance: action.retryGuidance || "",
      };
    }

    case "VERIFY_SUCCESS": {
      return {
        ...state,
        step: FLOW_STEP.UPDATE,
        isLoading: false,
        flowStatus: FLOW_STATUS.SUCCESS,
        fieldErrors: {
          ...state.fieldErrors,
          currentPassword: "",
        },
        fieldStates: {
          ...state.fieldStates,
          currentPassword: FLOW_STATUS.SUCCESS,
          newPassword: FLOW_STATUS.DEFAULT,
          confirmPassword: FLOW_STATUS.DEFAULT,
        },
        formError: "",
        retryGuidance: "",
      };
    }

    case "BACK_TO_VERIFY": {
      return {
        ...state,
        step: FLOW_STEP.VERIFY,
        flowStatus: FLOW_STATUS.DEFAULT,
        isLoading: false,
        newPassword: "",
        confirmPassword: "",
        fieldErrors: {
          ...state.fieldErrors,
          newPassword: "",
          confirmPassword: "",
        },
        fieldStates: {
          ...state.fieldStates,
          newPassword: FLOW_STATUS.DEFAULT,
          confirmPassword: FLOW_STATUS.DEFAULT,
        },
        formError: "",
        retryGuidance: "",
      };
    }

    case "UPDATE_VALIDATION_ERROR": {
      return {
        ...state,
        isLoading: false,
        flowStatus: FLOW_STATUS.VALIDATION_ERROR,
        fieldErrors: {
          ...state.fieldErrors,
          ...action.fieldErrors,
        },
        fieldStates: applyErrorStates(
          state,
          action.fieldErrors,
          FLOW_STATUS.VALIDATION_ERROR
        ),
        formError: action.formError || "",
        retryGuidance: action.retryGuidance || "",
      };
    }

    case "UPDATE_REQUEST": {
      return {
        ...state,
        isLoading: true,
        flowStatus: FLOW_STATUS.LOADING,
        fieldErrors: {
          ...state.fieldErrors,
          newPassword: "",
          confirmPassword: "",
        },
        fieldStates: {
          ...state.fieldStates,
          newPassword: FLOW_STATUS.LOADING,
          confirmPassword: FLOW_STATUS.LOADING,
        },
        formError: "",
        retryGuidance: "",
      };
    }

    case "UPDATE_FAILURE": {
      const flowStatus = action.flowStatus || FLOW_STATUS.API_ERROR;

      return {
        ...state,
        isLoading: false,
        flowStatus,
        fieldErrors: {
          ...state.fieldErrors,
          ...action.fieldErrors,
        },
        fieldStates: {
          ...state.fieldStates,
          newPassword: action.fieldErrors?.newPassword
            ? flowStatus
            : state.fieldStates.newPassword,
          confirmPassword: action.fieldErrors?.confirmPassword
            ? flowStatus
            : state.fieldStates.confirmPassword,
          currentPassword: action.fieldErrors?.currentPassword
            ? flowStatus
            : state.fieldStates.currentPassword,
        },
        formError: action.formError || "",
        retryGuidance: action.retryGuidance || "",
      };
    }

    case "UPDATE_SUCCESS": {
      return {
        ...state,
        step: FLOW_STEP.SUCCESS,
        isLoading: false,
        flowStatus: FLOW_STATUS.SUCCESS,
        fieldErrors: {
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        },
        fieldStates: {
          currentPassword: FLOW_STATUS.SUCCESS,
          newPassword: FLOW_STATUS.SUCCESS,
          confirmPassword: FLOW_STATUS.SUCCESS,
        },
        formError:
          action.formError ||
          "Password updated successfully. Redirecting you to login for security.",
        retryGuidance: "",
      };
    }

    default:
      return state;
  }
};

const getFeedbackClass = (flowStatus) => {
  if (flowStatus === FLOW_STATUS.RATE_LIMITED) return "rate_limited";
  if (flowStatus === FLOW_STATUS.SUCCESS) return "success";
  if (flowStatus === FLOW_STATUS.VALIDATION_ERROR) return "validation_error";
  return "api_error";
};

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const normalizeApiResult = (result) => {
  if (!result || typeof result !== "object") {
    return { ok: false, status: 500, data: { message: "Invalid API response" } };
  }

  return {
    ok: Boolean(result.ok),
    status: Number(result.status || 0),
    data: result.data || {},
  };
};

const ChangePasswordModal = ({
  isOpen,
  onRequestClose,
  userId,
  authToken,
  onPasswordUpdated,
  onSessionExpired,
  apiClient = changePasswordApi,
}) => {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  const modalRef = useRef(null);
  const currentPasswordRef = useRef(null);
  const newPasswordRef = useRef(null);

  const checklist = useMemo(
    () => getPasswordChecklist(state.newPassword),
    [state.newPassword]
  );

  const isUpdateFormValid = useMemo(() => {
    const errors = validateUpdateStep({
      currentPassword: state.currentPassword,
      newPassword: state.newPassword,
      confirmPassword: state.confirmPassword,
    });
    return Object.keys(errors).length === 0 && isPasswordStrong(checklist);
  }, [checklist, state.confirmPassword, state.currentPassword, state.newPassword]);

  useEffect(() => {
    if (!isOpen) return;
    dispatch({ type: "RESET" });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const previousActiveElement = document.activeElement;

    const focusTimer = window.setTimeout(() => {
      if (state.step === FLOW_STEP.VERIFY) {
        currentPasswordRef.current?.focus();
      } else if (state.step === FLOW_STEP.UPDATE) {
        newPasswordRef.current?.focus();
      }
    }, 0);

    const handleKeyDown = (event) => {
      if (!modalRef.current) return;

      if (event.key === "Escape" && !state.isLoading) {
        event.preventDefault();
        onRequestClose?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = Array.from(
        modalRef.current.querySelectorAll(focusableSelector)
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", handleKeyDown);
      if (previousActiveElement && typeof previousActiveElement.focus === "function") {
        previousActiveElement.focus();
      }
    };
  }, [isOpen, onRequestClose, state.isLoading, state.step]);

  if (!isOpen) return null;

  const handleVerifySubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateVerifyStep(state.currentPassword);

    if (Object.keys(validationErrors).length > 0) {
      dispatch({
        type: "VERIFY_VALIDATION_ERROR",
        flowStatus: FLOW_STATUS.VALIDATION_ERROR,
        fieldErrors: validationErrors,
      });
      return;
    }

    if (!userId) {
      dispatch({
        type: "VERIFY_FAILURE",
        flowStatus: FLOW_STATUS.API_ERROR,
        fieldErrors: {},
        formError: "Unable to identify your account. Please sign in again.",
        retryGuidance: "Refresh the page or log in again and retry.",
      });
      return;
    }

    dispatch({ type: "VERIFY_REQUEST" });

    try {
      const rawResult = await apiClient.verifyCurrentPassword({
        userId,
        currentPassword: state.currentPassword,
        token: authToken,
      });
      const result = normalizeApiResult(rawResult);

      if (result.ok) {
        dispatch({ type: "VERIFY_SUCCESS" });
        return;
      }

      const mappedError = mapPasswordApiError({
        status: result.status,
        data: result.data,
        step: FLOW_STEP.VERIFY,
      });

      dispatch({
        type: "VERIFY_FAILURE",
        ...mappedError,
      });

      if (mappedError.shouldRedirectToLogin && typeof onSessionExpired === "function") {
        onSessionExpired(mappedError.formError);
      }
    } catch (_error) {
      dispatch({
        type: "VERIFY_FAILURE",
        flowStatus: FLOW_STATUS.API_ERROR,
        fieldErrors: {},
        formError: "Network error while verifying current password.",
        retryGuidance: "Check your connection and try again.",
      });
    }
  };

  const handleUpdateSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateUpdateStep({
      currentPassword: state.currentPassword,
      newPassword: state.newPassword,
      confirmPassword: state.confirmPassword,
    });

    if (Object.keys(validationErrors).length > 0) {
      dispatch({
        type: "UPDATE_VALIDATION_ERROR",
        fieldErrors: validationErrors,
      });
      return;
    }

    dispatch({ type: "UPDATE_REQUEST" });

    try {
      const rawResult = await apiClient.updatePassword({
        userId,
        currentPassword: state.currentPassword,
        newPassword: state.newPassword,
        token: authToken,
      });
      const result = normalizeApiResult(rawResult);

      if (result.ok) {
        dispatch({ type: "UPDATE_SUCCESS" });

        if (typeof onPasswordUpdated === "function") {
          await new Promise((resolve) => window.setTimeout(resolve, 400));
          await onPasswordUpdated();
        }

        return;
      }

      const mappedError = mapPasswordApiError({
        status: result.status,
        data: result.data,
        step: FLOW_STEP.UPDATE,
      });

      dispatch({
        type: "UPDATE_FAILURE",
        ...mappedError,
      });

      if (mappedError.shouldRedirectToLogin && typeof onSessionExpired === "function") {
        onSessionExpired(mappedError.formError);
      }
    } catch (_error) {
      dispatch({
        type: "UPDATE_FAILURE",
        flowStatus: FLOW_STATUS.API_ERROR,
        fieldErrors: {},
        formError: "Network error while updating password.",
        retryGuidance: "Check your connection and try again.",
      });
    }
  };

  const renderVerifyStep = () => {
    const verifyDisabled = state.isLoading || !state.currentPassword.trim();

    return (
      <form className="cp-form" onSubmit={handleVerifySubmit} noValidate>
        <p className="cp-step-label">Step 1 of 2</p>
        <p className="cp-subtitle">
          Verify your current password to continue.
        </p>

        <div
          className="cp-field"
          data-state={state.fieldStates.currentPassword}
        >
          <label className="cp-label" htmlFor="cp-current-password">
            Current Password
          </label>
          <div className="cp-input-wrap">
            <input
              ref={currentPasswordRef}
              id="cp-current-password"
              name="currentPassword"
              className="cp-input"
              type={state.showCurrentPassword ? "text" : "password"}
              value={state.currentPassword}
              onFocus={() => dispatch({ type: "FIELD_FOCUS", field: "currentPassword" })}
              onBlur={() => dispatch({ type: "FIELD_BLUR", field: "currentPassword" })}
              onChange={(event) =>
                dispatch({
                  type: "FIELD_CHANGE",
                  field: "currentPassword",
                  value: event.target.value,
                })
              }
              aria-label="Current Password"
              aria-invalid={Boolean(state.fieldErrors.currentPassword)}
              aria-describedby={
                state.fieldErrors.currentPassword ? "cp-current-password-error" : undefined
              }
              autoComplete="current-password"
            />
            <button
              type="button"
              className="cp-toggle"
              onClick={() =>
                dispatch({
                  type: "TOGGLE_VISIBILITY",
                  field: "showCurrentPassword",
                })
              }
              aria-label={
                state.showCurrentPassword ? "Hide current password" : "Show current password"
              }
            >
              {state.showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state.fieldErrors.currentPassword && (
            <div id="cp-current-password-error" className="cp-field-error">
              {state.fieldErrors.currentPassword}
            </div>
          )}
        </div>

        {state.formError && (
          <div className={`cp-feedback ${getFeedbackClass(state.flowStatus)}`} role="alert">
            {state.formError}
            {state.retryGuidance ? (
              <div className="cp-guidance">{state.retryGuidance}</div>
            ) : null}
          </div>
        )}
        {!state.formError && state.retryGuidance ? (
          <div className="cp-guidance" role="note">
            {state.retryGuidance}
          </div>
        ) : null}

        <div className="cp-actions">
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={onRequestClose}
            disabled={state.isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="cp-btn cp-btn-primary"
            disabled={verifyDisabled}
          >
            {state.isLoading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </form>
    );
  };

  const renderUpdateStep = () => {
    const updateDisabled = state.isLoading || !isUpdateFormValid;

    return (
      <form className="cp-form" onSubmit={handleUpdateSubmit} noValidate>
        <p className="cp-step-label">Step 2 of 2</p>
        <p className="cp-subtitle">
          Set your new password and confirm it before update.
        </p>

        <div className="cp-field" data-state={state.fieldStates.newPassword}>
          <label className="cp-label" htmlFor="cp-new-password">
            New Password
          </label>
          <div className="cp-input-wrap">
            <input
              ref={newPasswordRef}
              id="cp-new-password"
              name="newPassword"
              className="cp-input"
              type={state.showNewPassword ? "text" : "password"}
              value={state.newPassword}
              onFocus={() => dispatch({ type: "FIELD_FOCUS", field: "newPassword" })}
              onBlur={() => dispatch({ type: "FIELD_BLUR", field: "newPassword" })}
              onChange={(event) =>
                dispatch({
                  type: "FIELD_CHANGE",
                  field: "newPassword",
                  value: event.target.value,
                })
              }
              aria-label="New Password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors.newPassword)}
              aria-describedby={
                state.fieldErrors.newPassword ? "cp-new-password-error" : undefined
              }
            />
            <button
              type="button"
              className="cp-toggle"
              onClick={() =>
                dispatch({
                  type: "TOGGLE_VISIBILITY",
                  field: "showNewPassword",
                })
              }
              aria-label={state.showNewPassword ? "Hide new password" : "Show new password"}
            >
              {state.showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state.fieldErrors.newPassword && (
            <div id="cp-new-password-error" className="cp-field-error">
              {state.fieldErrors.newPassword}
            </div>
          )}
        </div>

        <div className="cp-checklist" aria-live="polite">
          {PASSWORD_RULES.map((rule) => {
            const passed = checklist[rule.key];
            return (
              <div
                key={rule.key}
                className={`cp-check-item ${passed ? "passed" : ""}`}
              >
                {passed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                <span>{rule.label}</span>
              </div>
            );
          })}
        </div>

        <div className="cp-field" data-state={state.fieldStates.confirmPassword}>
          <label className="cp-label" htmlFor="cp-confirm-password">
            Confirm New Password
          </label>
          <div className="cp-input-wrap">
            <input
              id="cp-confirm-password"
              name="confirmPassword"
              className="cp-input"
              type={state.showConfirmPassword ? "text" : "password"}
              value={state.confirmPassword}
              onFocus={() => dispatch({ type: "FIELD_FOCUS", field: "confirmPassword" })}
              onBlur={() => dispatch({ type: "FIELD_BLUR", field: "confirmPassword" })}
              onChange={(event) =>
                dispatch({
                  type: "FIELD_CHANGE",
                  field: "confirmPassword",
                  value: event.target.value,
                })
              }
              aria-label="Confirm New Password"
              autoComplete="new-password"
              aria-invalid={Boolean(state.fieldErrors.confirmPassword)}
              aria-describedby={
                state.fieldErrors.confirmPassword ? "cp-confirm-password-error" : undefined
              }
            />
            <button
              type="button"
              className="cp-toggle"
              onClick={() =>
                dispatch({
                  type: "TOGGLE_VISIBILITY",
                  field: "showConfirmPassword",
                })
              }
              aria-label={
                state.showConfirmPassword
                  ? "Hide confirm password"
                  : "Show confirm password"
              }
            >
              {state.showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state.fieldErrors.confirmPassword && (
            <div id="cp-confirm-password-error" className="cp-field-error">
              {state.fieldErrors.confirmPassword}
            </div>
          )}
        </div>

        {state.formError && (
          <div className={`cp-feedback ${getFeedbackClass(state.flowStatus)}`} role="alert">
            {state.formError}
            {state.retryGuidance ? (
              <div className="cp-guidance">{state.retryGuidance}</div>
            ) : null}
          </div>
        )}
        {!state.formError && state.retryGuidance ? (
          <div className="cp-guidance" role="note">
            {state.retryGuidance}
          </div>
        ) : null}

        <div className="cp-actions">
          <button
            type="button"
            className="cp-btn cp-btn-secondary"
            onClick={() => dispatch({ type: "BACK_TO_VERIFY" })}
            disabled={state.isLoading}
          >
            Back
          </button>
          <button
            type="submit"
            className="cp-btn cp-btn-primary"
            disabled={updateDisabled}
          >
            {state.isLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    );
  };

  const renderSuccessStep = () => (
    <div>
      <div className="cp-success-icon" aria-hidden="true">
        ✓
      </div>
      <p className="cp-step-label">Password Updated</p>
      <p className="cp-subtitle">{state.formError}</p>
    </div>
  );

  return (
    <div
      className="cp-overlay"
      aria-hidden={false}
      onMouseDown={() => {
        if (!state.isLoading) onRequestClose?.();
      }}
    >
      <div
        className="cp-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cp-modal-title"
        ref={modalRef}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="cp-header">
          <h3 id="cp-modal-title" className="cp-title">
            Change Password
          </h3>
          <button
            type="button"
            className="cp-close-btn"
            onClick={onRequestClose}
            disabled={state.isLoading}
            aria-label="Close change password modal"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

        <div className="cp-body">
          {state.step === FLOW_STEP.VERIFY ? renderVerifyStep() : null}
          {state.step === FLOW_STEP.UPDATE ? renderUpdateStep() : null}
          {state.step === FLOW_STEP.SUCCESS ? renderSuccessStep() : null}

          <div className="cp-flow-state" aria-live="polite">
            Runtime state: {state.flowStatus.replace("_", " ")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
