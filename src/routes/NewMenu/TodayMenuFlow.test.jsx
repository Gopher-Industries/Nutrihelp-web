import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { UserContext } from '../../context/user.context';
import { TodayMenuProvider } from '../../context/TodayMenuContext';
import Meal from '../Meal/Meal';
import Dashboard from './Dashboard';

// ---------- Mocks ----------
jest.mock('../Meal/MotivationalPopup', () => () => <div data-testid="motivational-popup" />);
jest.mock('../../components/Dashboard-Graph', () => () => <div data-testid="dashboard-graph" />);
jest.mock('../../components/WaterTracker', () => () => <div data-testid="water-tracker" />);
jest.mock('../Meal/PDFExport', () => ({
  exportMealPlanAsPDF: jest.fn(),
}));
jest.mock('../../services/mealPlanApi', () => ({
  getMealPlans: jest.fn().mockResolvedValue([]),
  saveMealPlan: jest.fn().mockResolvedValue({ success: true }),
  __esModule: true,
  default: {
    getMealPlans: jest.fn().mockResolvedValue([]),
    saveMealPlan: jest.fn().mockResolvedValue({ success: true }),
  }
}));

// Fixture user — user_id drives the localStorage key: todayMenu_test-user-1
const FIXTURE_USER = { user_id: 'test-user-1', email: 'test@example.com' };
const STORAGE_KEY = `todayMenu_${FIXTURE_USER.user_id}`; // "todayMenu_test-user-1"

const TODAY_KEY = (() => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
})();

// Pre-built saved menu matching the fixture items available on the Meal page
const SAVED_MENU = {
  items: [{ name: 'Oatmeal', mealType: 'breakfast', details: { calories: 150, fats: 300, proteins: 500, vitamins: 80, sodium: 300 } }],
  totalNutrition: { calories: 150, proteins: 500, fats: 300, vitamins: 80, sodium: 300 },
  savedAt: new Date().toISOString(),
  dateKey: TODAY_KEY,
};

// ---------- Helpers ----------
const renderWithProvider = (ui) =>
  render(
    <BrowserRouter>
      <UserContext.Provider value={{ currentUser: FIXTURE_USER, setCurrentUser: jest.fn(), logOut: jest.fn() }}>
        <TodayMenuProvider>
          {ui}
        </TodayMenuProvider>
      </UserContext.Provider>
    </BrowserRouter>
  );

// ---------- Tests ----------
describe('Today Menu Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // ── Test 1: save flow ──────────────────────────────────────────────────────
  test('user can select items, save them, and see saved confirmation', async () => {
    renderWithProvider(<Meal />);

    // Select Oatmeal (Breakfast)
    const oatmealItem = screen.getByText('Oatmeal');
    fireEvent.click(oatmealItem);

    // Save to Today Menu (wait for it to appear/be enabled after initial load)
    const saveButton = await screen.findByText('Save to Today Menu');
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Success feedback appears
    expect(await screen.findByText('Saved Successfully!')).toBeInTheDocument();

    // Data was persisted to localStorage under the correct key
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).not.toBeNull();
    expect(stored.items.some(i => i.name === 'Oatmeal')).toBe(true);
  });

  // ── Test 2: empty state ───────────────────────────────────────────────────
  test('dashboard shows empty state when no menu is saved', async () => {
    // No localStorage data, API returns []
    await act(async () => {
      renderWithProvider(<Dashboard />);
    });

    expect(screen.getByText("No Menu Saved for Today")).toBeInTheDocument();
    expect(screen.getByText('Choose Meals')).toBeInTheDocument();
  });

  // ── Test 3: edit roundtrip ────────────────────────────────────────────────
  test('Edit Today Menu button in dashboard has correct href to /meal', async () => {
    // Pre-save valid data under the correct storage key
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAVED_MENU));

    await act(async () => {
      renderWithProvider(<Dashboard />);
    });

    const editButton = await screen.findByText('Edit Today Menu');
    expect(editButton).toBeInTheDocument();

    const link = editButton.closest('a');
    expect(link.getAttribute('href')).toBe('/meal');
  });

  // ── Test 4: reload persistence ────────────────────────────────────────────
  test('dashboard still shows saved menu after unmount and remount (reload persistence)', async () => {
    // Pre-populate localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAVED_MENU));

    // First mount
    const { unmount } = await act(async () => renderWithProvider(<Dashboard />));
    expect(await screen.findByText('MENU')).toBeInTheDocument();

    // Unmount (simulates page unload)
    unmount();

    // Second mount (simulates page revisit / reload)
    await act(async () => {
      renderWithProvider(<Dashboard />);
    });

    // Dashboard should still show the saved menu, not empty state
    expect(screen.queryByText('No Menu Saved for Today')).not.toBeInTheDocument();
    expect(await screen.findByText('MENU')).toBeInTheDocument();
  });

  // ── Test 5: direct /dashboard (no location.state) ────────────────────────
  test('direct navigation to /dashboard shows persisted menu without location.state', async () => {
    // Pre-populate localStorage (simulates a previous session save)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAVED_MENU));

    // Render Dashboard directly — no location.state passed
    await act(async () => {
      renderWithProvider(<Dashboard />);
    });

    // Should show the saved menu header, not the empty state
    expect(await screen.findByText('MENU')).toBeInTheDocument();
    expect(screen.queryByText('No Menu Saved for Today')).not.toBeInTheDocument();

    // Nutrition graph should be rendered (data loaded)
    expect(screen.getByTestId('dashboard-graph')).toBeInTheDocument();
  });
});
