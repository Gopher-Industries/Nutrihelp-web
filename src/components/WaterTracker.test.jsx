import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WaterTracker from './WaterTracker';
import { UserContext } from '../context/user.context';

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, data: [] }),
  })
);

beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
  global.fetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ success: true, data: [] }),
    })
  );
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWaterTracker = (user = null) => {
  return render(
    <UserContext.Provider value={{ currentUser: user }}>
      <WaterTracker />
    </UserContext.Provider>
  );
};

describe('WaterTracker Component', () => {
  test('renders correctly and initializes at 0', () => {
    renderWaterTracker();
    expect(screen.getByTestId('tracker-count')).toHaveTextContent('0 / 8');
  });

  test('increments water glasses but stops at 8', async () => {
    renderWaterTracker();
    const increaseBtn = screen.getByLabelText('Increase water glasses');

    for (let i = 0; i < 8; i++) {
      await act(async () => {
        fireEvent.click(increaseBtn);
      });
    }

    expect(screen.getByTestId('tracker-count')).toHaveTextContent('8 / 8');

    // Try one more
    await act(async () => {
      fireEvent.click(increaseBtn);
    });
    expect(screen.getByTestId('tracker-count')).toHaveTextContent('8 / 8');
  });

  test('decrements water glasses but stops at 0', async () => {
    renderWaterTracker();
    const decreaseBtn = screen.getByLabelText('Decrease water glasses');
    await act(async () => {
      fireEvent.click(decreaseBtn);
    });
    expect(screen.getByTestId('tracker-count')).toHaveTextContent('0 / 8');
  });

  test('changes stage based on cups (sad -> neutral -> excited -> medal)', async () => {
    renderWaterTracker();
    const increaseBtn = screen.getByLabelText('Increase water glasses');

    // 0 is sad
    expect(screen.getByLabelText('Current hydration stage: sad')).toBeInTheDocument();
    expect(screen.getByLabelText('Hydration level 0%')).toBeInTheDocument();

    // 3 is neutral
    for (let i = 0; i < 3; i++) {
      await act(async () => { fireEvent.click(increaseBtn); });
    }
    expect(screen.getByLabelText('Current hydration stage: neutral')).toBeInTheDocument();
    expect(screen.getByLabelText('Hydration level 38%')).toBeInTheDocument();

    // 6 is excited
    for (let i = 0; i < 3; i++) {
      await act(async () => { fireEvent.click(increaseBtn); });
    }
    expect(screen.getByLabelText('Current hydration stage: excited')).toBeInTheDocument();
    expect(screen.getByLabelText('Hydration level 75%')).toBeInTheDocument();

    // 8 is medal
    for (let i = 0; i < 2; i++) {
      await act(async () => { fireEvent.click(increaseBtn); });
    }
    expect(screen.getByLabelText('Current hydration stage: medal')).toBeInTheDocument();
    expect(screen.getByLabelText('Hydration level 100%')).toBeInTheDocument();
    expect(screen.getByTestId('goal-confetti')).toBeInTheDocument();
  });

  test('saves to localStorage on increment', async () => {
    const user = { id: 'test-123' };
    renderWaterTracker(user);
    const increaseBtn = screen.getByLabelText('Increase water glasses');

    await act(async () => {
      fireEvent.click(increaseBtn); // 1 cup
    });

    const stored = JSON.parse(localStorage.getItem('water_tracker_data'));
    expect(stored).not.toBeNull();
    expect(stored.glasses).toBe(1);
    expect(stored.userId).toBe('test-123');
  });

  test('calls backend sync on increment silently', async () => {
    const user = { id: 'user-789' };
    renderWaterTracker(user);

    const increaseBtn = screen.getByLabelText('Increase water glasses');
    await act(async () => {
      fireEvent.click(increaseBtn);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith('http://localhost/api/water-intake', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ user_id: 'user-789', glasses_consumed: 1 })
    }));
  });
});
