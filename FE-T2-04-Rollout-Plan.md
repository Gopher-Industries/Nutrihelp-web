# FE-T2-04 — Code-Splitting Audit: React.lazy Rollout Plan

*NutriHelp Web — Frontend Sprint 2 Scoping*
*Prepared by: Auss, Frontend Development Lead*

## Objective

Identify which of the app's ~50 routes can safely be converted to React.lazy() lazy-loaded chunks, and propose a rollout order. This is a scoping deliverable only — no code changes are made as part of this ticket.

## Context

App.js statically imports all ~50 route components at the top of the file. Every user downloads the entire application on first load, including Admin dashboards that the overwhelming majority of users will never access.

## 1. Routes Currently Statically Imported

All route imports were confirmed directly from `src/App.js` and grouped by access level below.

| Group | Route count | Examples |
| --- | --- | --- |
| Public (unauthenticated) | 7 | Login, SignUp, ForgotPassword flow, MFAform, AuthCallback |
| Authenticated (AuthenticateRoute) | ~40 | Home, Meal, ShoppingList, CreateRecipe, SearchRecipes, Settings, etc. |
| Admin-gated (InternalAdminRoute) | 4 | AdminAuditDashboard, AdminDataCenter, AdminRecipeLibraryPage (x2) |

**Public (7):** `/login`, `/signup`, `/forgotPassword`, `/forgot`, `/forgot/verify`, `/forgot/reset`, `/mfa`, `/auth/callback`

**Authenticated (~40):** `/home`, `/faq`, `/leaderboard`, `/community`, `/community/post/:postId`, `/chat`, `/survey`, `/survey/result`, `/roadmap`, `/scan`, `/Scan`, `/dish/detail`, `/meal/detail`, `/account`, `/daily-plan-edit`, `createRecipe`, `searchRecipes`, `searchRecipes/:category`, `yourPreferences`, `userProfile`, `appointment`, `dietary-requirements`, `scan-products`, `scan-review`, `food-details/:foodName`, `upload-history`, `recipe-rating`, `ui-timer`, `menu`, `recipe`, `recipe/:id`, `/meal`, `/meal/:preselectedMealType`, `/weekly-plan`, `nutrition-calculator`, `/preferences`, `/symptomassessment`, `healthnews`, `healthnews/:id`, `dashboard`, `HealthTools`, `shopping-list`, `settings`, `HealthFAQ`, `ScanBarcode`

**Admin-gated (4):** `/admin/integration-audit`, `admin`, `admin/recipe-library/:id`, `admin/recipe-library/:id/edit`

> Note: `newMenu` is imported in App.js but never rendered as a route — a dead import contributing unused weight to the bundle, independent of this lazy-loading work.

## 2. Shared State / Context Dependencies

**ChatPage (risk):** Rendered in two places — as a normal route at `/chat`, and persistently inside `GlobalAuthenticatedLayout` as a floating assistant widget controlled by local state and a custom window event, outside `<Routes>` entirely. Lazy-loading it requires a Suspense boundary in both usages; a naive "wrap the route" change will miss the floating-widget instance.

**Global chrome components (keep eager):** `MainNavbar`, `TextToSpeechControl`, `ElderlyUtilityHub`, and `ToastContainer` render outside `<Routes>` on every page and are not route-scoped. Lazy-loading these would add a flash-of-missing-navbar with no bundle benefit.

**TodayMenuContext (no risk):** Mounted app-wide in `src/index.js`, not per-route, so it does not create a route-specific lazy-loading risk.

## 3. Admin-Gated Routes — Guard Confirmation

Confirmed directly from `InternalAdminRoute.jsx`: the guard logic (session check, role check, and a locked-down local-dev bypass behind `REACT_APP_ALLOW_DEV_ADMIN_BYPASS`) lives entirely in the wrapper component, not in the routed page itself. Wrapping the child in `React.lazy()` does not touch this logic — route guards will continue to work unchanged post-migration.

## 4. Loading Fallback Pattern

**Skeleton:** for pages with a recognizable list/card layout — Dashboard, Meal, ShoppingList, SearchRecipes.

**Spinner:** for short or structurally unpredictable pages — Settings, Account, forms.

Recommend building both as small shared components (e.g. `<RouteSkeleton />` and `<RouteSpinner />`) so Sprint 2 tickets can select one per route rather than inventing fallback UI per page. This pattern choice should be confirmed with the team before Sprint 2 execution begins, since other developers will build against it.

## 5. Proposed Rollout Order

| Phase | Routes | Rationale |
| --- | --- | --- |
| 1 | AdminAuditDashboard, AdminDataCenter, AdminRecipeLibraryPage | Lowest traffic (admin-only), currently shipped to every user for zero benefit. Guard logic lives in InternalAdminRoute wrapper, not the page, so it keeps working unchanged. |
| 2 | MFAform, ForgotPassword, ForgotPasswordVerify, ForgotPasswordReset, AuthCallback | Rarely hit, self-contained, no shared state dependencies. |
| 3 | UiTimer, HealthFAQ, SymptomAssessment, FitnessRoadmap, Leaderboard, RecipeRating, UploadHistory, FoodDetails | Used but not landing pages; low risk to defer loading. |
| 4 | ScanBarcode, Scan, ScanProducts, ScanMealReview, NutritionCalculator, Appointment, DietaryRequirements, HealthNews, NewsDetail, Community, PostDetail, ShoppingList, Settings | Mid-traffic feature pages; moderate savings once phases 1-3 are proven. |
| 5 | Home, Dashboard, Meal, WeeklyMealPlanPage, ChatPage, CreateRecipe, SearchRecipes | Do last / re-evaluate. Home and Dashboard are hit immediately post-login, so lazy-loading saves little. ChatPage is dual-mounted (route + persistent floating widget) and needs its own Suspense handling. Recipe flows are high-traffic core features. |

## 6. Estimated Bundle Size Impact

Reasoned estimate, not yet measured against a production build. The 4 admin routes plus the ~8-route auth-adjacent group (Phase 1-2, roughly 12 routes) are the strongest early candidates: admin dashboards and rarely-hit auth flows are pure dead weight for the ~95%+ of sessions that never touch them. Getting exact KB figures requires running a bundle analysis (source-map-explorer or webpack-bundle-analyzer) against `npm run build` — recommended as an early Sprint 2 ticket if this hasn't been run before.

## Definition of Done — Status

- [x] Every statically imported route listed, grouped by access level
- [x] Shared state/context risks identified (ChatPage, global chrome components)
- [x] Admin-gated routes flagged with guard-compatibility confirmed from source
- [x] Loading fallback pattern proposed (skeleton vs spinner)
- [x] Rollout order sequenced across 5 phases, low-risk to high-risk
- [x] Bundle size impact documented as a reasoned estimate; real measurement recommended as a follow-up
