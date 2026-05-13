import {
  getPasswordChecklist,
  isPasswordStrong,
  mapPasswordApiError,
  validateUpdateStep,
  validateVerifyStep,
} from "./changePasswordValidation";

describe("changePasswordValidation", () => {
  it("validates verify step current password requirement", () => {
    expect(validateVerifyStep("")).toEqual({
      currentPassword: "Current password is required.",
    });

    expect(validateVerifyStep("CurrentPass123!")).toEqual({});
  });

  it("returns checklist values and strong-password decision", () => {
    const weakChecklist = getPasswordChecklist("abc");
    expect(isPasswordStrong(weakChecklist)).toBe(false);

    const strongChecklist = getPasswordChecklist("StrongPass123!");
    expect(isPasswordStrong(strongChecklist)).toBe(true);
  });

  it("validates update step field-level rules", () => {
    const errors = validateUpdateStep({
      currentPassword: "CurrentPass123!",
      newPassword: "weak",
      confirmPassword: "weaker",
    });

    expect(errors.newPassword).toBeTruthy();
    expect(errors.confirmPassword).toBe("New password and confirmation do not match.");
  });

  it("maps rate-limited and invalid-password API responses", () => {
    const rateLimited = mapPasswordApiError({ status: 429, data: {}, step: "verify" });
    expect(rateLimited.flowStatus).toBe("rate_limited");

    const invalidPassword = mapPasswordApiError({
      status: 401,
      data: { error: "Invalid password" },
      step: "verify",
    });

    expect(invalidPassword.fieldErrors.currentPassword).toBe(
      "Current password is incorrect."
    );
  });
});
