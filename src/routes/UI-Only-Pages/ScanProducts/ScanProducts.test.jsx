import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScanProducts from './ScanProducts';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { scanMultipleImages, scanSingleImage } from '../../../services/imageScanApi';
import {
    fetchDailyMealSummary,
    fetchNutritionPreview,
} from '../../../services/mealLogApi';

jest.mock('../../../services/imageScanApi');
jest.mock('../../../services/mealLogApi');

const emptySummary = {
    total_calories: 0,
    entry_count: 0,
    meal_type_breakdown: {},
    meals: [],
};

const renderScanProducts = () => {
    return render(
        <MemoryRouter initialEntries={['/scan']}>
            <Routes>
                <Route path="/scan" element={<ScanProducts />} />
                <Route path="/scan-review" element={<ScanProducts mode="review" />} />
            </Routes>
        </MemoryRouter>
    );
};

const getUploadInput = () => document.querySelector('#file-upload');

describe('ScanProducts Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.URL.createObjectURL = jest.fn(() => 'blob:scan-preview');
        global.URL.revokeObjectURL = jest.fn();
        global.FileReader = class {
            readAsDataURL() {
                this.result = 'data:image/jpeg;base64,test';
                this.onload?.();
            }
        };
        global.Image = class {
            set src(_value) {
                this.onerror?.();
            }
        };
        fetchDailyMealSummary.mockResolvedValue(emptySummary);
        fetchNutritionPreview.mockImplementation((label) =>
            Promise.resolve({
                label,
                display_name: label,
                estimated_calories: 95,
                serving_description: '1 serving',
                available: true,
            })
        );
    });

    test('successfully uploads an image and renders scan result', async () => {
        scanSingleImage.mockResolvedValueOnce({
                label: 'Apple',
                confidence: 0.95,
                topk: [{ label: 'Apple', score: 0.95 }],
                matches: [{ label: 'Apple', score: 0.95 }],
                is_unclear: false,
                quality: { issues: [] },
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = getUploadInput();
        
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(scanSingleImage).toHaveBeenCalledWith(file, { topk: 3 });
            expect(screen.getAllByText(/Scan Result/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Apple/i).length).toBeGreaterThan(0);
        });
    });

    test('handles validation failure (no file selected)', async () => {
        renderScanProducts();

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        expect(screen.getByText(/Choose at least one image/i)).toBeTruthy();
        expect(scanMultipleImages).not.toHaveBeenCalled();
    });

    test('handles backend error (500)', async () => {
        scanSingleImage.mockRejectedValueOnce({
            message: 'Server Error',
            status: 500
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/Server Error/i)).toBeTruthy();
        });
    });

    test('handles network error', async () => {
        scanSingleImage.mockRejectedValueOnce(new Error('Network Error'));

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/Network Error/i)).toBeTruthy();
        });
    });

    test('renders multi-image results from predictions contract', async () => {
        scanMultipleImages.mockResolvedValueOnce({
            predictions: [
                {
                    label: 'Banana',
                    confidence: 0.91,
                    topk: [{ label: 'Banana', score: 0.91 }],
                    matches: [{ label: 'Banana', score: 0.91 }],
                    is_unclear: false,
                    quality: { issues: [] },
                },
                {
                    label: 'Orange',
                    confidence: 0.88,
                    topk: [{ label: 'Orange', score: 0.88 }],
                    matches: [{ label: 'Orange', score: 0.88 }],
                    is_unclear: false,
                    quality: { issues: [] },
                },
            ]
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'banana.png', { type: 'image/png' });
        const secondFile = new File(['dummy content'], 'orange.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file, secondFile] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Images/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(scanMultipleImages).toHaveBeenCalledWith([file, secondFile], { topk: 3 });
            expect(screen.getByText(/Scan Result 1/i)).toBeTruthy();
            expect(screen.getAllByText(/Banana/i).length).toBeGreaterThan(0);
            expect(screen.getByRole('button', { name: /Next image/i })).toBeTruthy();
        });
    });

    test('does not auto-fill meal info for retake review-only scans', async () => {
        scanSingleImage.mockResolvedValueOnce({
                label: '',
                confidence: 0.08,
                retake_needed: true,
                retake_reason: 'Image appears to be an illustration or portrait, not a clear food photo.',
                topk: [],
                matches: [],
                is_unclear: true,
                quality: {
                    issues: [
                        'Image appears to be an illustration or portrait, not a clear food photo.',
                    ],
                },
                nutrition: {
                    available: false,
                },
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'not-food.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/No confident food match/i)).toBeTruthy();
            expect(screen.getAllByText(/not a clear food photo/i).length).toBeGreaterThan(0);
        });

        fireEvent.click(screen.getByRole('button', { name: /Enter meal manually/i }));

        await waitFor(() => {
            expect(screen.getAllByText(/Choose a meal/i).length).toBeGreaterThan(0);
        });
    });

    test('does not prefill closed-set food candidates for non-food retake scenes', async () => {
        scanSingleImage.mockResolvedValueOnce({
                label: 'frozen_yogurt',
                confidence: 0.34,
                food_probability: 0.31,
                retake_needed: true,
                retake_reason: 'Image appears to show people or a non-food scene rather than a clear meal photo.',
                topk: [
                    { label: 'frozen_yogurt', score: 0.34 },
                    { label: 'ice_cream', score: 0.21 },
                ],
                matches: [],
                is_unclear: true,
                quality: {
                    issues: [
                        'Image appears to contain people rather than a clear food photo.',
                        'Image appears blurry.',
                    ],
                },
                nutrition: {
                    available: false,
                },
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'hospital.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/No confident food match/i)).toBeTruthy();
            expect(screen.queryByDisplayValue(/frozen_yogurt/i)).toBeNull();
            expect(screen.queryByText(/Suggested match: Frozen Yogurt/i)).toBeNull();
        });

        fireEvent.click(screen.getByRole('button', { name: /Enter meal manually/i }));

        await waitFor(() => {
            expect(screen.getAllByText(/Choose a meal/i).length).toBeGreaterThan(0);
            expect(screen.queryByDisplayValue(/frozen_yogurt/i)).toBeNull();
        });
    });

    test('pre-fills top suggestion for reviewable food scans', async () => {
        scanSingleImage.mockResolvedValueOnce({
                label: 'steak',
                confidence: 0.34,
                food_probability: 0.31,
                retake_needed: true,
                retake_reason: null,
                topk: [
                    { label: 'steak', score: 0.34 },
                    { label: 'sushi', score: 0.21 },
                ],
                matches: [],
                is_unclear: true,
                quality: { issues: [] },
                nutrition: {
                    available: false,
                },
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'steak.png', { type: 'image/png' });
        const input = getUploadInput();
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/Suggested match: Steak/i)).toBeTruthy();
            expect(fetchNutritionPreview).toHaveBeenCalledWith('steak');
        });

        fireEvent.click(screen.getByRole('button', { name: /Review this match/i }));

        await waitFor(() => {
            expect(screen.getByDisplayValue(/steak/i)).toBeTruthy();
            expect(fetchNutritionPreview).toHaveBeenCalledWith('steak');
        });
    });
});
