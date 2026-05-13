import BaseApi from './baseApi';

class ScanApi extends BaseApi {
    constructor() {
        super();
    }

    /**
     * Upload one or more images for AI analysis
     * @param {File[]} files - Array of files to upload
     * @param {boolean} isMulti - Whether to use the multi-image AI contract
     */
    async uploadForAnalysis(files, isMulti = false) {
        try {
            const selectedFiles = Array.from(files || []).filter(Boolean);
            const results = [];

            for (const file of selectedFiles) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await fetch(`${this.baseURL}/imageClassification`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        ...(this.getAuthToken() && { 'Authorization': `Bearer ${this.getAuthToken()}` })
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw {
                        status: response.status,
                        message: errorData.error || errorData.message || 'Failed to classify image(s)',
                        data: errorData
                    };
                }

                const data = await response.json();
                results.push(data);
            }

            return this.mapScanResponse(results, isMulti || results.length > 1);
        } catch (error) {
            console.error('Scan Analysis Error:', error);
            throw error;
        }
    }

    /**
     * Normalizes the response from different AI contracts
     */
    mapScanResponse(data, isMulti) {
        const normalizedItems = (Array.isArray(data) ? data : [data]).map((item) => {
            const classification = item?.data?.classification || item?.classification || {};
            return {
                prediction: classification.label || classification.rawLabel || 'Unknown',
                confidence: classification.confidence || 0,
                metadata: item?.data?.explainability || item?.explainability || {}
            };
        });

        if (isMulti) {
            return {
                results: normalizedItems,
                isMulti: true
            };
        }

        return {
            results: normalizedItems,
            isMulti: false,
            prediction: normalizedItems[0]?.prediction || 'Unknown'
        };
    }
}

export const scanApi = new ScanApi();
export default scanApi;
