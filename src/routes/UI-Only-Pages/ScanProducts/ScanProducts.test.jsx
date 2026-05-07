import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ScanProducts from './ScanProducts';
import { BrowserRouter } from 'react-router-dom';
import scanApi from '../../../services/scanApi';
import { toast } from 'react-toastify';

// Mock scanApi
jest.mock('../../../services/scanApi');
// Mock toast
jest.mock('react-toastify');

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
    });

    test('successfully uploads an image and navigates', async () => {
        scanApi.uploadForAnalysis.mockResolvedValueOnce({
            prediction: 'Apple',
            results: [{ prediction: 'Apple', confidence: 0.95 }]
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
        
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(scanApi.uploadForAnalysis).toHaveBeenCalled();
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Apple'));
        });
    });

    test('handles validation failure (no file selected)', async () => {
        renderScanProducts();

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        expect(screen.getByText(/Please select at least one image/i)).toBeInTheDocument();
        expect(scanApi.uploadForAnalysis).not.toHaveBeenCalled();
    });

    test('handles backend error (500)', async () => {
        scanApi.uploadForAnalysis.mockRejectedValueOnce({
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
            expect(screen.getByText(/Server Error/i)).toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledWith('Server Error');
        });
    });

    test('handles network error', async () => {
        scanApi.uploadForAnalysis.mockRejectedValueOnce(new Error('Network Error'));

        renderScanProducts();

        const file = new File(['dummy content'], 'apple.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Network Error');
        });
    });

    test('contract mismatch fallback (single instead of multi)', async () => {
        scanApi.uploadForAnalysis.mockResolvedValueOnce({
            prediction: 'Banana',
            results: [{ prediction: 'Banana' }]
        });

        renderScanProducts();

        const file = new File(['dummy content'], 'banana.png', { type: 'image/png' });
        const input = screen.getByLabelText(/Image/i);
        fireEvent.change(input, { target: { files: [file] } });

        const uploadButton = screen.getByRole('button', { name: /Analyze Image/i });
        fireEvent.click(uploadButton);

        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Banana'));
        });
    });
});
