import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScanProducts from './ScanProducts';
import { BrowserRouter } from 'react-router-dom';
import { scanMultipleImages } from '../../../services/imageScanApi';
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
        <BrowserRouter>
            <ScanProducts />
        </BrowserRouter>
    );
};

describe('ScanProducts Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.URL.createObjectURL = jest.fn(() => 'blob:scan-preview');
        global.URL.revokeObjectURL = jest.fn();
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
        scanMultipleImages.mockResolvedValueOnce({
            predictions: [{
                label: 'Apple',
                confidence: 0.95,
                topk: [{ label: 'Apple', score: 0.95 }],
                matches: [{ label: 'Apple', score: 0.95 }],
                is_unclear: false,
                quality: { issues: [] },
            }]
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
        
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(scanMultipleImages).toHaveBeenCalledWith([file], { topk: 5 });
            expect(screen.getByText(/Scan Result/i)).toBeTruthy();
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
        scanMultipleImages.mockRejectedValueOnce({
            message: 'Server Error',
            status: 500
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(screen.getByText(/Server Error/i)).toBeTruthy();
        });
    });

    test('handles network error', async () => {
        scanMultipleImages.mockRejectedValueOnce(new Error('Network Error'));

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
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
        const input = screen.getByLabelText(/Image/i);
        fireEvent.change(input, { target: { files: [file, secondFile] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Images/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(scanMultipleImages).toHaveBeenCalledWith([file, secondFile], { topk: 5 });
            expect(screen.getByText(/Scan Result 1/i)).toBeTruthy();
            expect(screen.getByText(/Scan Result 2/i)).toBeTruthy();
            expect(screen.getAllByText(/Banana/i).length).toBeGreaterThan(0);
            expect(screen.getAllByText(/Orange/i).length).toBeGreaterThan(0);
        });
    });
});
