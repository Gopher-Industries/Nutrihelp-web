import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ChangePasswordModal from "./ChangePasswordModal";

const setup = (overrides = {}) => {
  const apiClient =
    overrides.apiClient ||
    {
      verifyCurrentPassword: jest
        .fn()
        .mockResolvedValue({ ok: true, status: 200, data: {} }),
      updatePassword: jest
        .fn()
        .mockResolvedValue({ ok: true, status: 200, data: {} }),
    };

  const onPasswordUpdated = overrides.onPasswordUpdated || jest.fn();
  const onSessionExpired = overrides.onSessionExpired || jest.fn();
  const onRequestClose = overrides.onRequestClose || jest.fn();

  render(
    <ChangePasswordModal
      isOpen
      onRequestClose={onRequestClose}
      userId="user-123"
      authToken="token-abc"
      apiClient={apiClient}
      onPasswordUpdated={onPasswordUpdated}
      onSessionExpired={onSessionExpired}
    />
  );

  return {
    apiClient,
    onPasswordUpdated,
    onSessionExpired,
    onRequestClose,
  };
};

describe("ChangePasswordModal", () => {
  it("runs full verify -> update success flow", async () => {
    const onPasswordUpdated = jest.fn().mockResolvedValue(undefined);
    const { apiClient } = setup({ onPasswordUpdated });

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "CurrentPass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await screen.findByText("Step 2 of 2");

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "NewStrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewStrongPass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(apiClient.updatePassword).toHaveBeenCalledTimes(1);
      expect(onPasswordUpdated).toHaveBeenCalledTimes(1);
    });
  });

  it("shows inline field error when current password is invalid", async () => {
    const { apiClient } = setup({
      apiClient: {
        verifyCurrentPassword: jest.fn().mockResolvedValue({
          ok: false,
          status: 401,
          data: { error: "Invalid password" },
        }),
        updatePassword: jest.fn(),
      },
    });

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "WrongPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await waitFor(() => {
      expect(apiClient.verifyCurrentPassword).toHaveBeenCalledTimes(1);
      expect(screen.getByText("Current password is incorrect.")).toBeTruthy();
      expect(
        screen.getByText("Re-enter your current password and try again.")
      ).toBeTruthy();
    });
  });

  it("handles rate-limited update error state", async () => {
    setup({
      apiClient: {
        verifyCurrentPassword: jest
          .fn()
          .mockResolvedValue({ ok: true, status: 200, data: {} }),
        updatePassword: jest.fn().mockResolvedValue({
          ok: false,
          status: 429,
          data: {},
        }),
      },
    });

    fireEvent.change(screen.getByLabelText("Current Password"), {
      target: { value: "CurrentPass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Verify" }));

    await screen.findByText("Step 2 of 2");

    fireEvent.change(screen.getByLabelText("New Password"), {
      target: { value: "NewStrongPass123!" },
    });
    fireEvent.change(screen.getByLabelText("Confirm New Password"), {
      target: { value: "NewStrongPass123!" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Update Password" }));

    await waitFor(() => {
      expect(
        screen.getByText("Too many attempts. Please wait before trying again.")
      ).toBeTruthy();
      expect(screen.getByText("Try again in about 60 seconds.")).toBeTruthy();
    });
  });
});
