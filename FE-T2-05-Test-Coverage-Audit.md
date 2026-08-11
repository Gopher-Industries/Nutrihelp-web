# FE-T2-05 — Test Coverage Audit

*NutriHelp Web — Frontend Sprint 2 Scoping*
*Prepared by: Auss, Frontend Development Lead*

## Objective

Map current automated test coverage against the app's actual surface area, and prioritise the next components to cover. This is a scoping deliverable only — no tests are written as part of this ticket.

## Context

Only 7 test files exist across 171 source components (confirmed by direct file count against the repository). Auth and meal planning — the two most business-critical flows — have essentially no coverage.

## Current Coverage

**Coverage:** 7 of 171 source components have an associated test file — approximately 4.1%.

**Testing stack:** `react-scripts test` (Create React App / Jest) with `@testing-library/react` and `@testing-library/dom`. No Cypress, Playwright, or other end-to-end tool is installed, so recommendations below work within the existing Jest/RTL setup rather than assuming a new dependency.

## 1. Existing Test Files and What They Cover

| File | Covers |
| --- | --- |
| components/WaterTracker.test.jsx | Water tracking widget |
| routes/UI-Only-Pages/ScanProducts/ScanProducts.test.jsx | Scan products page |
| routes/UI-Only-Pages/UserProfilePage/ChangePasswordModal.test.jsx | Change-password modal (RTL + mocked API client) |
| routes/UI-Only-Pages/UserProfilePage/changePasswordValidation.test.js | Password validation logic (unit-level) |
| utils/ttsRouteUtils.test.js | TTS route utility |
| utils/ttsTextCollector.test.js | TTS text collection |
| utils/voiceSettingsManager.test.js | Voice settings manager |

## 2. Critical Flows vs. Coverage

| Flow | Files involved | Coverage |
| --- | --- | --- |
| Login / Auth session | Login.jsx, user.context.jsx, AuthenticateRoute.js | None. user.context.jsx (~400 lines: token refresh, session TTL, storage sync) has zero tests. |
| MFA | MFAform.jsx | None. |
| Meal planning | Meal.jsx, WeeklyMealPlanPage.jsx, WeeklyMealPlan.jsx, PersonalizedWeeklyPlan.jsx, DailyPlanEdit.jsx, PDFExport.js (16 files total) | None. |
| Recipe creation | CreateRecipe.jsx + 8 supporting files (Fields, SectionIngredients, Inputs, Prompt, etc.) | None. |
| Scan (barcode + product) | Scan.jsx, ScanBarcode.jsx, ScanProducts.jsx, ScanMealReview.jsx, FoodDetails.js | Partial — only ScanProducts.jsx is tested. |
| Password change | ChangePasswordModal.jsx + validation | Covered. |

## 3. Top 5 Highest Risk-to-Coverage Gap

| Rank | Component / Flow | Why it's top priority |
| --- | --- | --- |
| 1 | user.context.jsx | Every authenticated route depends on it. Complex token-refresh and session-TTL logic. Highest risk in the app; a silent break here fails the whole app. |
| 2 | Login.jsx + AuthenticateRoute | First thing every user hits. A regression here blocks entry to the entire app. |
| 3 | Meal.jsx (meal planning) | Explicitly business-critical per project brief; 16-file untested cluster, largest gap in the app. |
| 4 | CreateRecipe.jsx (recipe creation) | Second-largest untested cluster (9 files); core content-creation flow. |
| 5 | MFAform.jsx | Small surface area but security-sensitive — a silent regression here is a vulnerability, not just a UX bug. |

## 4. Recommended Testing Approach Per Flow

**user.context.jsx:** Unit tests with Jest, mocking fetch/localStorage/sessionStorage directly — it's pure logic, not a component, so RTL isn't needed. Highest value, lowest effort.

**Login / MFA:** RTL integration tests following the existing pattern in ChangePasswordModal.test.jsx (mock the API client, assert on rendered states with fireEvent). That file is a ready-made template.

**Meal planning / Recipe creation:** Full per-file coverage isn't realistic in one sprint given the size of each cluster. Scope RTL tests to the top-level page component (Meal.jsx, CreateRecipe.jsx) covering the main happy path plus one error path, rather than one test per sub-component.

**Scan barcode:** Extend the existing ScanProducts.test.jsx pattern to ScanBarcode.jsx and ScanMealReview.jsx for parity.

## 5. Prioritised List for Sprint 2

1. user.context.jsx — unit tests (auth/session logic)
2. Login.jsx + AuthenticateRoute — integration test
3. MFAform.jsx — integration test
4. Meal.jsx — happy-path + error-path integration test
5. CreateRecipe.jsx — happy-path + error-path integration test

## Definition of Done — Status

- [x] Current coverage % calculated (4.1%, 7/171 files)
- [x] Gap list produced across all critical user flows (Login, MFA, Meal planning, Recipe creation, Scan)
- [x] Prioritised top-5 list ready for Sprint 2 test-writing tickets
