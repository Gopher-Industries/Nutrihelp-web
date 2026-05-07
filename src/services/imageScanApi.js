import AIBaseApi from "./aiApi";

class ImageScanApi extends AIBaseApi {
  async scanSingleImage(file, { topk = 3 } = {}) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${this.baseURL}/ai-model/image-analysis/image-analysis?topk=${topk}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      throw new Error(data?.detail || data?.error || "Failed to scan image.");
    }
    return data;
  }
}

export const imageScanApi = new ImageScanApi();
export const scanSingleImage = (...args) => imageScanApi.scanSingleImage(...args);
