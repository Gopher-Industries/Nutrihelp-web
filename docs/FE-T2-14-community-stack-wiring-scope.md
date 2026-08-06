# FE-T2-14 — Scope: Community Stack Wiring into MainTabs

| | |
|---|---|
| **Ticket** | FE-T2-14 |
| **Type** | Scoping / spike (no production code changes) |
| **Branch** | `FE-T2-14-scope-community-stack-wiring-into-maintabs` |
| **Objective** | Scope what is needed to wire the Community stack (Feed, Post Detail, Create Post, Leaderboard) into MainTabs. The build happens in Sprint 2. |
| **Repos in scope** | `NutriHelp-App-2026` (mobile target), `Nutrihelp-web` (source of the feature to port), `Nutrihelp-api` (backend reuse assessment) |
| **Related** | FE-T2-12 (SOS mobile port scope) — shares the MainTabs real-estate discussion |

---

## 1. What is already scaffolded on mobile

### 1.1 The Community stack exists and is complete as a skeleton

`src/navigation/CommunityStack.jsx` in `NutriHelp-App-2026` defines a standard
`createStackNavigator` with exactly the four screens this ticket covers, all rendering the shared
`_PlaceholderScreen`:

| Route name | Title | Component today |
|---|---|---|
| `FeedScreen` (initial route) | "Community" | `_PlaceholderScreen` |
| `PostDetailScreen` | "Post" | `_PlaceholderScreen` |
| `CreatePostScreen` | "Create Post" | `_PlaceholderScreen` |
| `LeaderboardScreen` | "Leaderboard" | `_PlaceholderScreen` |

So the navigation shell needs **no structural work** — route names, titles and the initial route are
already decided. What is missing:

1. **The stack is not reachable.** `MainTabs.jsx` imports six stacks (Home, Meal, Recipe, Scan,
   HealthPlan, Account) and `CommunityStack` is not among them. No other navigator references it either.
2. **All four screens are placeholders.** There are no community screens, components, API modules or
   contexts anywhere else in the mobile repo.

### 1.2 The wiring itself is a two-line change — the decision is where the tab goes

Mechanically, wiring means adding an import plus a `<Tab.Screen name="Community"
component={CommunityStack} />` in `MainTabs.jsx`, and a `Community: "people"` entry in
`TAB_ICON_BY_ROUTE`. The real scoping question is tab-bar real estate:

- The tab bar already holds **six tabs** (Home, Meals, Recipes, Scan, AI Plan, Profile). A seventh is
  physically possible with `@react-navigation/bottom-tabs` but labels get tight on small devices, and
  FE-T2-12 already rejected adding a tab for SOS on crowding grounds.
- **Recommendation:** add Community as the seventh tab as directed, but pair it with a label audit at
  the smallest supported device width (and consider whether `Scan` or `AI Plan` could later fold into
  another stack — that consolidation is a separate decision for the TL, not part of this ticket).
- Alternatives if seven tabs is rejected at review: an entry card on the Home screen navigating into
  `CommunityStack` nested in `HomeStack`, or the drawer (`@react-navigation/drawer` is already a
  dependency but is currently unused by `AppNavigator`).
- No conflict with FE-T2-12: the SOS work adds a floating button, not a tab, so both tickets can land
  in Sprint 2 without fighting over the tab bar.

### 1.3 Mobile building blocks already available for the build

| Need | Already in the repo |
|---|---|
| Card/list UI | `src/components/common/Card.jsx`, `EmptyState.jsx`, `LoadingSpinner.jsx`, `ScreenLayout.jsx`, `NavigationHeader.jsx` |
| Editor container | `src/components/common/BottomSheet.jsx` |
| Image attachment in Create Post | `expo-image-picker` (already a dependency) |
| Native share sheet | React Native's built-in `Share` API — direct equivalent of web's `navigator.share` |
| Local persistence | `@react-native-async-storage/async-storage` |
| Auth/user identity | `UserContext` (`useUser()`), same JWT auth as the rest of the app |
| Font scaling for elderly users | `AccessibilityContext` (`fs()` / `sh()`) |

---

## 2. Web Community implementation — what actually needs porting

The single most important finding: **the entire web Community feature is client-local.** It reads and
writes `localStorage` (`community_posts` key), seeds itself with five hardcoded demo posts, and never
touches the backend. Several of its interactions are cosmetic. The port should reproduce what web
*actually does*, not what the UI implies it does — anything more is new feature work, not porting.

### 2.1 Feed (`src/routes/Community/Community.jsx`)

- **Data:** loads `community_posts` from localStorage, else seeds 5 mock posts (with Unsplash images
  and relative-string timestamps like "2 hours ago"). Every change is written straight back to
  localStorage.
- **Post shape:** `{ id, author: { id, name, avatar, verified }, content, image, category, likes,
  comments, shares, timestamp, tags[] }`.
- **Category filter:** 6 filter tabs — All, Weight Loss, Fitness, Dietary Restrictions, Meal Prep,
  Nutrition Tips — rendered both as a select and as tab buttons. **Known inconsistency:** Create Post
  offers 8 categories (adds Success Story, Recipe Share, Motivation) that the feed filter cannot
  select. The port should reconcile the two lists (recommend: one shared constant).
- **Sorting:** Newest / Oldest / Most Liked / Most Commented / Most Shared. **Newest and Oldest are
  no-ops** — timestamps are relative strings, so the code comment admits `Date(...)` won't work and
  falls back to stable order. The port should store real ISO timestamps from day one and make all five
  sorts actually work; that is a fix, not scope creep.
- **Search:** case-insensitive substring match over content, author name and tags; session-only search
  history (last 5); hardcoded "popular tags" suggestions.
- **Voice search:** `VoiceSearchButton` uses the browser's **Web Speech API**
  (`window.SpeechRecognition || webkitSpeechRecognition`). **There is no React Native equivalent
  without a new native dependency** (e.g. `@react-native-voice/voice` or `expo-speech-recognition`,
  plus microphone permissions on both platforms). Recommend **deferring voice search** out of the
  Sprint 2 build into its own ticket.
- **Stats banner:** "2.4K Members / 156 Posts Today / 89 Top Contributors" is hardcoded. Recommend
  omitting on mobile rather than porting fake numbers.

### 2.2 Post interactions (feed card + detail)

| Interaction | What web actually does | Port implication |
|---|---|---|
| **Like** | Count +/- is persisted into the post record, but the *per-user* liked state is component `useState(false)` — it resets on refresh, and nothing stops re-liking | Persist per-user liked-post ids locally so the heart state survives restarts; keep count logic |
| **Comment** | Button navigates to `/community/post/:id#comments` via `window.location.href` (full page reload). Comments on the detail page are **mock data**; new comments only mutate local state | `navigation.navigate("PostDetailScreen", { postId })`; comments stay device-local |
| **Share** | `navigator.share` with clipboard fallback | RN `Share.share()` — clean 1:1 port, no fallback needed |
| **Bookmark** | Pure component state — **not persisted anywhere, and no bookmarks list exists** | Either persist locally or drop the button; recommend persisting the flag (cheap) and deferring a "saved posts" list |
| **Edit / Delete own post** | Shown when `currentUser.uid === post.author.id`; delete uses `window.confirm` | RN `Alert.alert` confirm; same ownership check via `useUser()` |
| **Image tap** | Full-screen `ImageModal` with prev/next across all post images | RN `Modal`; straightforward |

### 2.3 Post Detail (`PostDetail.jsx`)

Loads the post from `localStorage` by id; falls back to a hardcoded mock post. Comments (including
nested replies) are **entirely mock** — `mockComments` array, with add-comment appending to local
state only. Like/bookmark on the detail page have the same non-persisted behaviour as the feed card.

### 2.4 Create Post (`components/CreatePost.jsx`)

Modal form: content text (required), category select (8 options — see mismatch above), free-text tags,
optional image with a 5 MB cap converted to a **base64 data URL** stored inside the post record.
**Mobile caution:** AsyncStorage on Android has a ~2 MB per-entry / 6 MB total default budget — storing
base64 images inside the posts array will blow it. The build should store images as files
(`expo-image-picker` returns a file URI already) and keep only the URI in the record.

### 2.5 Leaderboard (`src/routes/LeaderBoard/leaderBoard.jsx`)

Not really a leaderboard: it is a fitness-journey profile UI whose backend check is literally a
`useState(false)` with the comment `// Simulate backend check`. A commented-out fetch to
`/api/fitness-Journey` confirms the endpoint never materialised. There is **no ranking data anywhere**.
The mobile `LeaderboardScreen` therefore has nothing meaningful to port — see priority call in
Section 4.

---

## 3. Backend reuse — confirmed: nothing exists, nothing is reusable

Searches across `Nutrihelp-api` (routes, controllers, models, validators and the 171 KB OpenAPI
`index.yaml`) for community/post/feed/leaderboard terms return only recipe-related hits ("community
recipes" in the recipe library) and nothing else:

- **No routes** — `routes/` has no community, feed, post or leaderboard router; `routeGroups.js`
  mounts nothing of the kind.
- **No models/controllers** — nothing for posts, comments, likes, bookmarks or rankings.
- **No OpenAPI definitions** — `index.yaml` contains no community or leaderboard paths.

This matches the web implementation being localStorage-only: the web team never needed endpoints, so
none were built. **The answer to "can backend endpoints be reused as-is" is no — there are none.**

Consequence for Sprint 2: the build has two honest options.

1. **Port the web behaviour as-is: device-local AsyncStorage with the same seed posts.** Matches web
   parity exactly, needs no backend coordination, ships within the sprint. Posts are per-device and
   not social in any real sense — but that is precisely what web ships today.
2. **Block on a backend Community API** (posts + comments + likes CRUD, storage bucket for images,
   auth-scoped ownership). Real social behaviour, but it is a new backend workstream, not a port, and
   it would stall the wiring ticket.

**Recommendation: option 1 for Sprint 2**, with a clearly-filed backend ticket (posts/comments/likes
endpoints + Supabase tables + image storage) as the follow-up that unlocks real cross-user feeds on
both platforms. The mobile data layer should be isolated in one module (`src/api/communityApi.js` or a
`communityStorage.js` util) so swapping AsyncStorage for HTTP later touches one file.

---

## 4. Which screen to build first

**FeedScreen, unambiguously.** The recommended build order:

| Priority | Screen | Reasoning |
|---|---|---|
| **1. FeedScreen** | The tab's initial route — until it exists, wiring the tab just exposes a placeholder. It carries the core value (browse posts), and it forces the data layer (storage module, post shape, seed data) that every other screen consumes. Filters, sorting and text search live here. | |
| **2. PostDetailScreen** | First screen reachable *from* the feed (card tap, comment tap). Needs the feed's data layer plus local comments. | |
| **3. CreatePostScreen** | Turns the feed from read-only into participatory. Depends on the same data layer; adds image picking and validation. Worth shipping in the same sprint if capacity allows, but the feed is usable without it thanks to seed data. | |
| **4. LeaderboardScreen** | **Lowest priority — recommend leaving it a placeholder in Sprint 2.** The web "leaderboard" is a simulated fitness-journey UI with no ranking data and no backend (Section 2.5). There is nothing to port; building it means designing a new feature. Keep the route (already scaffolded) and file it separately. | |

This order also de-risks review: each PR is independently testable (feed with seed data → detail →
create), and a slip on screens 3–4 still leaves a shippable Community tab.

---

## 5. Sprint 2 build ticket

> Copy the section below into the tracker as the buildable Sprint 2 ticket.

### FE-T2-15 — Wire Community tab into MainTabs and build Feed + Post Detail + Create Post

**Repo:** `NutriHelp-App-2026`
**Depends on:** FE-T2-14 (this scope)
**Blocked by:** nothing — deliberately scoped to require no backend change

#### Description

Make the already-scaffolded `CommunityStack` reachable as a MainTabs tab and replace the placeholder
Feed, Post Detail and Create Post screens with working implementations ported from the web Community
feature. Persistence is device-local AsyncStorage matching web's localStorage behaviour; a backend
Community API is a separate follow-up ticket. Leaderboard remains a placeholder (separate ticket).

#### Scope

**In scope**
- `MainTabs.jsx`: import `CommunityStack`, add `Community` tab with the `people` Ionicon
- `src/utils/communityStorage.js` (or `src/api/communityApi.js`): AsyncStorage data layer — same post
  shape as web, same 5 seed posts, **ISO timestamps** instead of relative strings
- `FeedScreen`: post cards, category filter (single shared category list), all five sort options
  working, text search, pull-to-refresh
- `PostDetailScreen`: post view, device-local comments with add-comment, like/share/bookmark
- `CreatePostScreen`: content + category + tags + optional image via `expo-image-picker` (image kept
  as file URI, never base64 in AsyncStorage), edit/delete own posts
- Per-user liked-post and bookmarked-post ids persisted locally so button states survive restarts
- Share via React Native `Share.share()`

**Out of scope** (each gets its own ticket)
- Voice search (needs a new native speech-to-text dependency + mic permissions)
- LeaderboardScreen implementation (no web feature exists to port)
- Backend Community API and cross-user feeds; migration off AsyncStorage
- Community stats banner (hardcoded numbers on web — do not port)

#### Acceptance criteria

**Wiring**
1. A "Community" tab appears in the tab bar with the `people` icon, following the existing
   focused/outline icon pattern, and opens `FeedScreen`.
2. All existing six tabs still render and navigate correctly; tab labels remain legible at the
   smallest supported device width in both light and dark themes.
3. Community screens are only reachable when authenticated (stack sits inside `MainTabs`).

**Feed**
4. First launch seeds the same five demo posts as web; subsequent launches load persisted state.
5. Category filter shows one canonical category list (the 8 create-post categories + "All"), and
   filtering matches web semantics.
6. All five sorts work, including Newest/Oldest (fixed by storing ISO timestamps).
7. Search matches content, author name and tags case-insensitively; clearing it restores the feed.
8. Empty results show `EmptyState`, not a blank screen.

**Interactions**
9. Like toggles per user and persists across an app restart (count and heart state both correct).
10. Card tap opens Post Detail for that post; comment icon opens the same screen.
11. Share opens the native share sheet with the post link/text.
12. Bookmark state persists across restart.
13. Create Post validates required content, saves with the current user as author, and the new post
    appears at the top of the feed; images picked via `expo-image-picker` stay file-URI based.
14. Edit and delete are only visible on the user's own posts; delete asks for confirmation via
    `Alert.alert`.
15. Comments added on Post Detail persist on the device and increment the post's comment count.

**Quality**
16. No AsyncStorage entry contains base64 image data.
17. Text respects `AccessibilityContext` scaling at all three font-size settings.
18. Unit tests cover the storage module (seed, save, like toggle, sort comparators, search filter).
19. FloatingChatbot and (once merged) the SOS FAB remain correctly positioned above the tab bar with
    the extra tab present.

---

## Appendix — evidence trail

| Claim | Source |
|---|---|
| Stack scaffolded, 4 placeholder screens | `NutriHelp-App-2026/src/navigation/CommunityStack.jsx` |
| Not wired into tabs | `NutriHelp-App-2026/src/navigation/MainTabs.jsx` (imports six stacks, no Community) |
| Web feed is localStorage + 5 seed posts | `Nutrihelp-web/src/routes/Community/Community.jsx` (`loadPosts`, `community_posts` key) |
| Newest/Oldest sort is a no-op | code comment in `Community.jsx` sort block (relative-string timestamps) |
| Category list mismatch (6 vs 8) | `Community.jsx` `categories` vs `components/CreatePost.jsx` `categories` |
| Voice search is Web Speech API | `src/components/VoiceControl/VoiceSearchButton.jsx` (`window.SpeechRecognition \|\| webkitSpeechRecognition`) |
| Like/bookmark per-user state not persisted | `PostCard` in `Community.jsx` (`useState(false)`) |
| Detail comments are mock | `PostDetail.jsx` (`mockComments`, "Keep mock comments for now") |
| Create Post stores base64 image, 5 MB cap | `components/CreatePost.jsx` (`FileReader.readAsDataURL`) |
| Web leaderboard simulates its backend | `LeaderBoard/leaderBoard.jsx` (`// Simulate backend check`); commented-out `/api/fitness-Journey` fetch in `FitnessJourney.jsx` |
| No backend endpoints exist | Searches across `Nutrihelp-api` routes/controllers/models and `index.yaml` — only recipe-library "community recipes" matches |
| Mobile building blocks | `NutriHelp-App-2026/package.json` (expo-image-picker, AsyncStorage), `src/components/common/` |
