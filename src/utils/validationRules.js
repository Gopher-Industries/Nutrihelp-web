/**
 * Validation rules for NutriHelp
 */

export const REGEX = {
  // name@domain.com
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,

  // 10 digit phone number (assuming AU/General 10 digit)
  PHONE: /^\d{10}$/,

  // Password: 8+ chars, at least one uppercase, one number, one special character
  PASSWORD: /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,

  // Barcode: Numeric only, common lengths are 8, 12, 13, 14
  BARCODE: /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/,

  // Positive numbers for quantity, servings
  POSITIVE_NUMBER: /^[1-9]\d*$/,

  // Positive floats for height, weight, etc.
  POSITIVE_FLOAT: /^\d*\.?\d+$/
};

export const ERROR_MESSAGES = {
  REQUIRED: "This field is required",
  EMAIL_INVALID: "Please enter a valid email address (e.g., name@example.com)",
  PHONE_INVALID: "Please enter a 10-digit phone number",
  PASSWORD_INVALID:
    "Password must be at least 8 characters long and include an uppercase letter, a number, and a special character",
  PASSWORD_MISMATCH: "Passwords do not match",
  BARCODE_INVALID: "Barcode must be 8, 12, 13, or 14 digits",
  POSITIVE_NUM_INVALID: "Please enter a positive number",
  FUTURE_DATE: "Date cannot be in the past",
  FUTURE_TIME: "Time cannot be in the past",
};

//Validates email format
export const validateEmail = (email) => {
  if (!email) return ERROR_MESSAGES.REQUIRED;
  return REGEX.EMAIL.test(email) ? null : ERROR_MESSAGES.EMAIL_INVALID;
};

//Validates password strength
export const validatePassword = (password) => {
  if (!password) return ERROR_MESSAGES.REQUIRED;
  return REGEX.PASSWORD.test(password) ? null : ERROR_MESSAGES.PASSWORD_INVALID;
};

//Validates phone format
export const validatePhone = (phone) => {
  if (!phone) return null; // Optional in some forms
  return REGEX.PHONE.test(phone) ? null : ERROR_MESSAGES.PHONE_INVALID;
};

//Validates barcode format
export const validateBarcode = (barcode) => {
  if (!barcode) return ERROR_MESSAGES.REQUIRED;
  return REGEX.BARCODE.test(barcode) ? null : ERROR_MESSAGES.BARCODE_INVALID;
};

//Validates if a value is a positive integer
export const validatePositiveNumber = (value) => {
  if (value === undefined || value === null || value === "")
    return ERROR_MESSAGES.REQUIRED;
  return REGEX.POSITIVE_NUMBER.test(String(value))
    ? null
    : ERROR_MESSAGES.POSITIVE_NUM_INVALID;
};

//Validates if a value is a positive float
export const validatePositiveFloat = (value) => {
  if (value === undefined || value === null || value === "")
    return ERROR_MESSAGES.REQUIRED;
  const num = Number(value);
  if (isNaN(num) || num <= 0) return ERROR_MESSAGES.POSITIVE_NUM_INVALID;
  return REGEX.POSITIVE_FLOAT.test(String(value))
    ? null
    : ERROR_MESSAGES.POSITIVE_NUM_INVALID;
};
