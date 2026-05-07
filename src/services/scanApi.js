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
            const formData = new FormData();
            
            // Task 3: Implement request builder for both contracts
            if (isMulti) {
                // Multi-image contract (future-proof)
                files.forEach((file) => {
                    formData.append('images', file);
                });
            } else {
                // Single-image contract (fallback)
                formData.append('image', files[0]);
            }

            // Task 1: Use centralized API config
            // In a real app, this might come from a config file, but here we use BaseApi's baseURL
            const endpoint = isMulti ? '/imageClassification/multi' : '/imageClassification';
            const url = `${this.baseURL}${endpoint}`;

            const response = await fetch(url, {
                method: 'POST',
                body: formData,
                headers: {
                    // Note: Browser automatically sets Content-Type for FormData with boundary
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
            
            // Task 4: Implement response mapper to normalize result shape
            return this.mapScanResponse(data, isMulti);
        } catch (error) {
            console.error('Scan Analysis Error:', error);
            throw error;
        }
    }

    /**
     * Normalizes the response from different AI contracts
     */
    mapScanResponse(data, isMulti) {
        // Multi-image contract normalization
        if (isMulti || (data.predictions && Array.isArray(data.predictions))) {
            return {
                results: (data.predictions || []).map(p => ({
                    prediction: p.prediction || p.label || 'Unknown',
                    confidence: p.confidence || 0,
                    metadata: p.metadata || {}
                })),
                isMulti: true
            };
        }

        // Single-image contract normalization
        return {
            results: [{
                prediction: data.prediction || 'Unknown',
                confidence: data.confidence || 1.0,
                metadata: data.metadata || {}
            }],
            isMulti: false,
            // Keep legacy single prediction field for backward compatibility
            prediction: data.prediction || 'Unknown'
        };
    }
}

export const scanApi = new ScanApi();
export default scanApi;
