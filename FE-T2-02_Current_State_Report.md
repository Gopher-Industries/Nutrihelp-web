# FE-T2-02 — Current State Baseline (Web + Mobile APK)

**Objective:** Establish an honest baseline of what is currently working across the NutriHelp web and mobile applications through live regression testing, supported by screenshots and code-level observations.

## Methodology and testing note

This baseline combines two forms of evidence:

1. **Live regression testing.** Major user flows were executed on the running web and mobile applications. Results were recorded as working, broken, not tested, placeholder, or N/A, with screenshots included in the accompanying `FE-T2-02_QA_Report.docx`.
2. **Code-level review.** Source-level observations were used to identify incomplete, placeholder, hard-coded, or potentially misconfigured functionality that should be considered during Sprint 1/2 planning.

The detailed test cases and screenshot evidence are maintained in the QA Regression Report.

## Current State Summary

| Feature Area | Web | Mobile APK | Current State / Notes |
|---|---|---|---|
| Auth | Partially working | Partially working | Valid login, invalid login handling, forgot/reset password, and logout work. Account creation/sign-up is broken on both platforms. |
| Meal Planning | Working | Partially broken | Core meal-plan generation/viewing works. On mobile, AI personalised plan generation and save/reopen are broken. Meal image preview is not visible and there is no specific weekly-plan page. |
| Recipes | Working | Partially broken | Browsing, opening, searching and filtering work on both. Mobile recipe creation is broken, and recipe image previews are not visible. |
| Scan | Broken | Broken | Food/barcode scanning and scan-result nutrition information are broken on both web and mobile. |
| Community | Reachable via URL only | Unreachable | Web Community pages (`/community`, post detail) exist and render but have **no navigation button** — reachable only by typing the URL directly (screenshots attached). On mobile, `CommunityStack` is not mounted in any navigator, so Community is completely unreachable; its screens are placeholders (D-01, D-16). |
| Admin | Reachable via URL only | N/A | Web Admin area (`/admin` data center, recipe library, integration audit) exists and renders but has **no navigation button** — reachable only via direct URL (screenshots attached); full admin flows not exercised (no admin credentials). Mobile has no Admin capability (N/A, D-15, D-16). |

## Detailed Live-Test Findings

### 1. Authentication

- **AUTH-01 — Valid login:** Works on web and mobile.
- **AUTH-02 — Invalid login:** Works on web and mobile; access is prevented. Web does not show the expected clear error.
- **AUTH-03 — Create account / sign up:** Broken on web and mobile. Account creation could not be completed.
- **AUTH-04 — Forgot / reset password:** Works on web and mobile. Mobile uses a three-step Forgot Password flow.
- **AUTH-05 — Logout:** Works on web and mobile and returns the user to login.

**Overall:** Authentication is **partially working** because the main login/logout and password-reset flows work, but new-account registration is broken.

### 2. Meal Planning

- **MEAL-01 — Generate/create meal plan:** Works on web and mobile. Mobile meal image preview is not visible.
- **MEAL-02 — View daily/weekly plan:** Works on web and mobile. Mobile does not provide a specific weekly-plan page.
- **MEAL-03 — AI personalised plan flow:** Works on web but is broken on mobile.
- **MEAL-04 — Save plan and reopen:** Works on web but is broken on mobile.

**Overall:** Web meal planning is working for the tested flows. Mobile meal planning is **partially broken**, particularly around AI personalised plans and persistence.

### 3. Recipes

- **REC-01 — Browse recipe list:** Works on web and mobile. Mobile image preview is not visible.
- **REC-02 — Open recipe detail:** Works on web and mobile. Mobile image preview is not visible.
- **REC-03 — Search/filter recipes:** Works on web and mobile.
- **REC-04 — Create a recipe:** Works on web but is broken on mobile.

**Overall:** Recipe functionality is working on web and **partially broken on mobile**.

### 4. Scan

- **SCAN-01 — Scan food/barcode:** Broken on web and mobile.
- **SCAN-02 — View scan result:** Broken on web and mobile.

**Overall:** The tested Scan functionality is currently **broken on both platforms**.

### 5. Community

- **COM-01 — View community feed:** Web page exists and renders but is reachable only by entering `/community` directly (no navigation button); screenshots attached. Mobile is an unreachable placeholder.
- **COM-02 — Create a post:** Web reachable only via URL; mobile unreachable placeholder.
- **COM-03 — Post detail/leaderboard:** Web reachable only via URL (`/community/post/:id`); mobile unreachable placeholder.

**Overall:** Web Community exists and loads but has no entry point in the UI (URL-only). Mobile Community is unreachable — the `CommunityStack` is not mounted in any navigator and its screens are placeholders.

### 6. Admin

- **ADM-01 — Access admin area:** Web Admin area exists and renders at `/admin` but has **no navigation button** — reachable only by entering the URL (screenshots attached). Full admin actions not exercised (no admin credentials). N/A on mobile (no Admin feature).
- **ADM-02 — Manage users/content:** Web Admin management pages exist (URL-only, no button); management actions not exercised without admin credentials. N/A on mobile.

**Overall:** Web Admin **exists and loads but has no UI entry point** (URL-only); full flows weren't exercised for lack of admin credentials. Mobile has no Admin capability. This is a deliberate scoping decision, not a claim that Admin is absent on web.

## Confirmed / Open Defect Baseline

The regression pass and code-level review identified the following items for follow-up:

| ID | Area | Severity | Finding | Status |
|---|---|---|---|---|
| D-01 | Community (mobile) | High | Community routes render shared placeholder/“Coming soon” functionality and Community is not in the mobile tab bar. `CommunityStack` is defined but **not mounted in any navigator**, so Community is completely unreachable on mobile. **Handover-doc mismatch:** the handover implied Community was present on mobile — testing contradicts this (regression). | Open |
| D-02 | Community (web) | Medium | Leaderboard Progress is incomplete and displays a coming-soon state. | Open |
| D-03 | Meal Planning (mobile) | Medium | EditDailyPlanScreen and MenuScreen are placeholders. | Open |
| D-04 | Meal Planning (web) | Medium | Shopping List uses hard-coded data and is not fully backend-wired. **Handover-doc claim confirmed:** handover described Shopping List v2 as a “UI-only prototype” — verified (hardcoded data + TODO to add the API later). | Open |
| D-05 | Scan (web) | Medium | Scan Products appears UI-only and requires backend integration/confirmation. | Open / confirm |
| D-06 | Account (mobile) | Medium | HealthToolsScreen routing points to a placeholder, leaving the built screen unreachable. | Open |
| D-07 | Home / Account (mobile) | Low | Several routes remain placeholders, including Health News, FAQ, Dietary Requirements, Shopping List and Appointments. | Open |
| D-08 | Meal / Health (mobile) | Medium | NutritionCalculator and HealthTools use hard-coded mock data instead of user data. | Open |
| D-09 | Config (mobile) | Medium | Some API services hard-code backend URLs rather than consistently using `EXPO_PUBLIC_API_BASE_URL`. | Open |
| D-10 | Config (mobile) | Medium | Default AI model configuration points to localhost, which is not directly reachable from a device/emulator without appropriate configuration. | Open |
| D-11 | Config (web) | Medium | Several web calls default to localhost when the API base URL is unset. | Open |
| D-12 | Security / hygiene (mobile) | Low | A Supabase anon key is present in `.env.example`; configuration hygiene should be reviewed. | Open |
| D-13 | Security / hygiene (web) | Low | Firebase web API configuration is hard-coded rather than sourced from environment/configuration. | Open |
| D-14 | Reliability (mobile) | Low | Empty catch blocks can silently swallow errors in several mobile flows. | Open |
| D-15 | Admin (mobile) | Low | No Admin capability exists on mobile. | By design / confirm |
| D-16 | Navigation (web) | Medium | Web Community (`/community`) and Admin (`/admin`) pages exist and render, but have no navigation links/buttons anywhere in the UI — they can only be reached by manually entering the URL. Users cannot discover them. | Open |

## Sprint 1/2 Planning Recommendations

The regression baseline shows that the web application currently has broader working functionality than the mobile application. The highest-priority areas are:

- Fix account creation/sign-up on both web and mobile.
- Fix the Scan flow on both platforms.
- Repair mobile AI personalised meal-plan generation and saved-plan persistence.
- Fix mobile recipe creation.
- Decide whether Community should be implemented on mobile or formally treated as web-only.
- Replace placeholder and mock-data screens with implemented flows where they are expected to be part of the product.
- Standardise mobile API configuration so services consistently use environment variables.
- Re-test all corrected flows and update the QA report with final evidence.

## Definition of Done Status

A shared FE-T2-02 baseline now exists for the major tested web and mobile flows. The accompanying `FE-T2-02_QA_Report.docx` contains the detailed test-case results and screenshot evidence. Known working, broken, incomplete, placeholder, not-tested and N/A areas are explicitly identified so Sprint 1/2 planning can use the report as a current-state reference.
