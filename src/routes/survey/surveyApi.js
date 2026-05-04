import { BaseApi } from "../../services/baseApi";

const baseApiInstance = new BaseApi();
export const API_BASE_URL = baseApiInstance.baseURL;

const toInt = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const num = Number(value);
  return Number.isInteger(num) ? num : Math.round(num);
};

const toFloat = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  return Number(value);
};

export const buildSurveyPayload = (formData) => ({
  Gender: toInt(formData.Gender),
  Age: toFloat(formData.Age),
  Height: toFloat(formData.Height),
  Weight: toFloat(formData.Weight),
  family_history_with_overweight: formData.family_history_with_overweight,
  FAVC: toInt(formData.FAVC),
  FCVC: toFloat(formData.FCVC),
  NCP: toFloat(formData.NCP),
  CAEC: toInt(formData.CAEC),
  SMOKE: toInt(formData.SMOKE),
  CH2O: toFloat(formData.CH2O),
  SCC: formData.SCC,
  FAF: toFloat(formData.FAF),
  TUE: toFloat(formData.TUE),
  CALC: toInt(formData.CALC),
  MTRANS: formData.MTRANS,
});

const describeErrorObject = (data) => {
  if (!data || typeof data !== "object") return null;

  if (data.detail && typeof data.detail === "object") {
    if (typeof data.detail.error === "string" && data.detail.error.trim()) {
      const nestedDetails = Array.isArray(data.detail.details)
        ? data.detail.details
        : [];
      const firstNested = nestedDetails[0];
      if (firstNested?.msg) {
        const fieldPath = Array.isArray(firstNested.loc)
          ? firstNested.loc[firstNested.loc.length - 1]
          : "field";
        return `${fieldPath}: ${firstNested.msg}`;
      }
      return data.detail.error;
    }
  }

  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  if (typeof data.detail === "string" && data.detail.trim()) return data.detail;

  if (data.errors && typeof data.errors === "object") {
    const firstError = Object.entries(data.errors)[0];
    if (firstError) {
      const [field, value] = firstError;
      if (typeof value === "string") return `${field}: ${value}`;
    }
  }

  return null;
};

export const getApiErrorMessage = async (response, fallbackMessage) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    try {
      const text = await response.text();
      if (text.trim()) return text.trim();
    } catch {
      // ignore secondary parse errors
    }
  }

  const described = describeErrorObject(data);
  if (described) return described;

  switch (response.status) {
    case 400:
    case 422:
      return "The submitted survey data is invalid. Please review your answers and try again.";
    case 429:
      return "Too many requests were sent. Please wait a moment and try again.";
    case 500:
      return "The backend could not process the survey right now. Please try again later.";
    default:
      return fallbackMessage;
  }
};
