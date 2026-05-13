export const PASSWORD_RULES = [
  {
    key: "minLength",
    label: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    key: "uppercase",
    label: "At least 1 uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    key: "lowercase",
    label: "At least 1 lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    key: "number",
    label: "At least 1 number",
    test: (password) => /[0-9]/.test(password),
  },
  {
    key: "special",
    label: "At least 1 special character",
    test: (password) => /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]/.test(password),
  },
];

export const getPasswordChecklist = (password = "") => {
  const value = String(password || "");
  return PASSWORD_RULES.reduce((acc, rule) => {
    acc[rule.key] = rule.test(value);
    return acc;
  }, {});
};

export const isPasswordStrong = (checklist = {}) =>
  PASSWORD_RULES.every((rule) => Boolean(checklist[rule.key]));

export const validateVerifyStep = (currentPassword = "") => {
  const errors = {};

  if (!String(currentPassword || "").trim()) {
    errors.currentPassword = "Current password is required.";
  }

  return errors;
};

export const validateUpdateStep = ({
  currentPassword = "",
  newPassword = "",
  confirmPassword = "",
}) => {
  const errors = {};

  if (!String(currentPassword || "").trim()) {
    errors.currentPassword = "Current password is required.";
  }

  const checklist = getPasswordChecklist(newPassword);
  if (!isPasswordStrong(checklist)) {
    errors.newPassword = "Please choose a stronger password that meets all requirements.";
  }

  if (String(newPassword || "").trim() === "") {
    errors.newPassword = "New password is required.";
  }

  if (String(confirmPassword || "").trim() === "") {
    errors.confirmPassword = "Please confirm your new password.";
  } else if (newPassword !== confirmPassword) {
    errors.confirmPassword = "New password and confirmation do not match.";
  }

  if (currentPassword && newPassword && currentPassword === newPassword) {
    errors.newPassword = "New password must be different from your current password.";
  }

  return errors;
};

const toLower = (value = "") => String(value || "").toLowerCase();

export const mapPasswordApiError = ({ status = 0, data = {}, step = "verify" }) => {
  const errorCode = String(
    data?.code || data?.errorCode || data?.error_code || ""
  ).toUpperCase();
  const message = String(data?.error || data?.message || "").trim();
  const messageLower = toLower(message);

  const response = {
    flowStatus: "api_error",
    fieldErrors: {},
    formError: message || "We could not process your request right now.",
    retryGuidance: "Please check your input and try again.",
    shouldRedirectToLogin: false,
  };

  if (status === 429 || errorCode.includes("RATE_LIMIT")) {
    response.flowStatus = "rate_limited";
    response.formError = "Too many attempts. Please wait before trying again.";
    response.retryGuidance = "Try again in about 60 seconds.";
    return response;
  }

  if (
    (status === 401 || status === 403) &&
    (
      errorCode.includes("TOKEN") ||
      errorCode.includes("UNAUTHORIZED") ||
      messageLower.includes("token") ||
      messageLower.includes("session") ||
      messageLower.includes("unauthorized") ||
      messageLower.includes("invalid user id")
    )
  ) {
    response.formError = "Your session has expired. Please sign in again.";
    response.retryGuidance = "You will be redirected to login for account recovery.";
    response.shouldRedirectToLogin = true;
    return response;
  }

  const isCurrentPasswordInvalid =
    errorCode === "CURRENT_PASSWORD_INVALID" ||
    errorCode === "INVALID_PASSWORD" ||
    messageLower.includes("invalid password") ||
    messageLower.includes("current password");

  if (isCurrentPasswordInvalid) {
    response.fieldErrors.currentPassword = "Current password is incorrect.";
    response.formError = "";
    response.retryGuidance = "Re-enter your current password and try again.";
    return response;
  }

  if (
    errorCode.includes("WEAK_PASSWORD") ||
    messageLower.includes("weak password") ||
    messageLower.includes("password strength")
  ) {
    response.fieldErrors.newPassword =
      "Your new password is too weak. Please meet all password requirements.";
    response.formError = "";
    response.retryGuidance = "Use a stronger password and submit again.";
    return response;
  }

  if (
    errorCode.includes("PASSWORD_MISMATCH") ||
    messageLower.includes("confirm") ||
    messageLower.includes("mismatch")
  ) {
    response.fieldErrors.confirmPassword =
      "New password and confirmation do not match.";
    response.formError = "";
    response.retryGuidance = "Update confirmation password and retry.";
    return response;
  }

  if (status >= 500) {
    response.formError = "Server error while processing password change.";
    response.retryGuidance = "Please try again shortly.";
    return response;
  }

  if (status === 400 && step === "verify") {
    response.fieldErrors.currentPassword = "Current password is required.";
    response.formError = "";
    response.retryGuidance = "Enter your current password to continue.";
  }

  if (status === 400 && step === "update" && !response.fieldErrors.newPassword) {
    response.fieldErrors.newPassword = "Please review your new password and try again.";
    response.formError = "";
  }

  return response;
};
