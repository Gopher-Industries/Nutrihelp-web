import BaseApi from "./baseApi";

export const AI_API_BASE_URL =
  process.env.REACT_APP_AI_API_BASE_URL || "http://localhost:8000";

export class AIBaseApi extends BaseApi {
  constructor(baseURL = AI_API_BASE_URL) {
    super(baseURL);
  }
}

export default AIBaseApi;
