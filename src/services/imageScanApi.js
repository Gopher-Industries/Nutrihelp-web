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

  async scanMultipleImages(files, { topk = 3 } = {}) {
    const selectedFiles = Array.from(files || []);

    if (selectedFiles.length === 0) {
      throw new Error("Please select at least one image before scanning.");
    }

    const predictions = await Promise.all(
      selectedFiles.map((file) => this.scanSingleImage(file, { topk }))
    );

    return { predictions };
  }
}

export const imageScanApi = new ImageScanApi();
export const scanSingleImage = (...args) => imageScanApi.scanSingleImage(...args);
export const scanMultipleImages = (...args) => imageScanApi.scanMultipleImages(...args);
