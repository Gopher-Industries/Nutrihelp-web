# FE-T2-12 , Scope: SOS Emergency Calling Port to Mobile

| | |
|---|---|
| **Ticket** | FE-T2-12 |
| **Type** | Scoping / spike (no production code changes) |
| **Branch** | `FE-T2-12-scope-sos-emergency-calling-port-to-mobile` |
| **Objective** | Scope the design and technical approach for porting SOS emergency calling from web to mobile. The build happens in Sprint 2. |
| **Repos in scope** | `Nutrihelp-web` (source of truth for behaviour), `NutriHelp-App-2026` (mobile target), `Nutrihelp-api` (backend reuse assessment) |
| **Outcome** | Approach agreed + Sprint 2 build ticket written (see [Section 6](#6-sprint-2-build-ticket)) |

**Why this matters:** mobile is the primary platform for our elderly users, and it currently has no SOS
capability at all. Web has had it since Sprint 1. This is the critical platform gap flagged for Sprint 2.

---

## 1. Existing web SOS implementation

### 1.1 Where the code lives

| File | Role |
|---|---|
| `src/utils/emergencyContactManager.js` | Single source of truth , persistence, validation, `tel:` formatting |
| `src/components/Accessibility/ElderlyUtilityHub.jsx` | **The live UI.** Floating hub containing the SOS action |
| `src/components/Accessibility/ElderlyUtilityHub.css` | Floating positioning and styling |
| `src/components/Accessibility/EmergencySOSButton.jsx` | Standalone SOS button , **not mounted anywhere** (see 1.6) |
| `src/App.js` | Mounts the hub in `GlobalAuthenticatedLayout` |
| `src/routes/UI-Only-Pages/UserProfilePage/userprofile.jsx` | Profile page fields for viewing/editing the contact |

### 1.2 Contact persistence

Persistence is **entirely client-side `localStorage`**. There is no server involvement whatsoever.

- **Storage key:** `nutrihelp_emergency_contacts_v1`
- **Stored shape:** a map keyed by user, holding exactly one contact each:
  ```json
  { "<userKey>": { "name": "Jane Doe", "phone": "0412345678" } }
  ```
- **User key derivation** (`App.js`): `currentUser?.id || currentUser?.user_id || currentUser?.email || ""`,
  then `normalizeEmergencyContactUserKey()` trims + lowercases it and falls back to the literal `"guest"`.
- **Sanitisation:** name trimmed to 80 chars, phone trimmed to 24 chars.
- **Phone validation:** digits-only check against `/^[0-9]{8,15}$/` , so formatting characters are allowed
  in the input but only 8–15 actual digits count.
- **Change broadcast:** saves dispatch a `nutrihelp:emergency-contact-changed` `CustomEvent` carrying
  `{ userKey, contact }`. The hub and the profile page both subscribe so the two views stay in sync.
  The profile page additionally listens to the native `storage` event for cross-tab sync.
- **Removal:** `removeEmergencyContact()` is just a save of an empty contact, which deletes the map entry.
- **Failure mode:** all storage reads/writes are wrapped in `try/catch` and fail silently, so a restricted
  browser degrades to "no contact saved" rather than crashing.

### 1.3 One-tap call trigger

```70:70:Nutrihelp-web/src/components/Accessibility/EmergencySOSButton.jsx
    window.location.href = telHref;
```

The live hub does the same thing at `ElderlyUtilityHub.jsx:166`. The href comes from
`toEmergencyTelHref(phone)`, which:

1. strips spaces, parentheses and hyphens,
2. preserves a leading `+` (international) and strips non-digits from the remainder,
3. returns `tel:<target>`, or an empty string if nothing usable is left.

**Behaviour on tap:**

- No valid contact saved → opens the inline editor form instead of dialling.
- `toEmergencyTelHref` returns empty → also falls back to the editor.
- Valid contact → **dials immediately, with no confirmation step in the app.** The browser/OS dialer
  provides the only confirmation.

### 1.4 Mount point and visibility

```105:105:Nutrihelp-web/src/App.js
      {currentUser ? <ElderlyUtilityHub userKey={emergencyContactUserKey} /> : null}
```

Rendered only for authenticated users, and the whole `GlobalAuthenticatedLayout` returns `null` on auth
routes (`isAuthPath(location.pathname)`), so SOS is hidden on login/signup screens.

### 1.5 Current web UI shape

- `.elderly-utility-hub` is `position: fixed`, `right: 18px`, `bottom: 18px`, `z-index: 1100`.
- A pill trigger ("Eco Senior") expands a menu of three actions: **Senior Mode** toggle,
  **SOS Call / Add SOS Contact**, and **Text To Speech**.
- The hub measures the chat assistant FAB (`.assistant-btn`) at runtime with `ResizeObserver` +
  `MutationObserver` and raises its own `bottom` so it always stacks *above* the chat button
  (`assistantBottom + assistantHeight + 12px` gap).
- Contact editing is an inline form (Name + Phone) with an "Edit in Profile" shortcut to `/userProfile`.

### 1.6 Two findings worth recording

1. **`EmergencySOSButton.jsx` is dead code.** It is a near-duplicate of the SOS logic inside
   `ElderlyUtilityHub` and is not imported anywhere in `src/`. The port should be based on
   `ElderlyUtilityHub`, which is the component actually shipping. Cleaning up the duplicate is a
   **separate web-side ticket** , explicitly not part of this one.
2. **The profile page does not send the emergency contact to the backend.** In `handleSaveChanges` the
   contact is written to `localStorage` first, and the API payload that follows contains only
   `username`, `firstName`, `lastName`, `email`, `contactNumber` and `address`:

```2145:2152:Nutrihelp-web/src/routes/UI-Only-Pages/UserProfilePage/userprofile.jsx
        const payload = {
          username: form.username.trim(),
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          contactNumber: form.phone.replace(/\s/g, ""),
          address: form.address.trim(),
        }
```

---

## 2. Backend endpoints and data models , what can be reused

### 2.1 Verdict up front

**Nothing on the backend currently stores emergency contacts, so there is no persistence layer to
reuse.** A repo-wide search for `emergency` across `Nutrihelp-api` returns exactly one unrelated hit in
`services/errorLogService.js`. There are no SOS routes, no controller, no validator fields and no
database columns.

**Recommendation for Sprint 2: keep the mobile port client-local (AsyncStorage), matching web.** This
keeps the critical gap closed within one sprint without blocking on a backend change plus a Supabase
migration. Server-side persistence becomes a separate backend ticket (see [Section 5](#5-gaps-vs-the-sprint-2-roadmap-ambition), gap 4).

### 2.2 What *is* reusable as-is

| Asset | Detail | Reusable? |
|---|---|---|
| Auth | `middleware/authenticateToken` , Bearer JWT | Yes , mobile already authenticates this way |
| Profile read | `GET /api/userprofile` | Yes, but returns no emergency fields |
| Profile write | `PUT /api/userprofile` | Yes, but silently ignores emergency fields |
| Mobile API client | `src/api/profileApi.js` already calls `/api/userprofile` | Yes , extendable later |
| Encryption pattern | `services/encryptionService` (AES-GCM) | Yes , the precedent to follow if/when we persist |

Note `routes/profile.js` is literally `module.exports = require('./userprofile')`, so `/api/profile` and
`/api/userprofile` are the same router. Web uses the former, mobile uses the latter.

### 2.3 Why the profile endpoint cannot silently absorb the new fields

Three separate layers would each reject or drop an `emergency_contact_phone` field today:

1. **Validator whitelist** , `validators/userProfileValidator.js` enumerates permitted keys
   (`name`, `username`, `first_name`, `last_name`, `contact_number`, `address`, `user_image`, `email`,
   plus a nested `profile.*` variant). Nothing else is recognised.
2. **Explicit column select** , both `model/getUserProfile.js` and `model/updateUserProfile.js` hard-code
   the `users` column list: `user_id, name, first_name, last_name, email, contact_number, mfa_enabled,
   address, image_id, registration_date, last_login, account_status, profile_encryption_*,
   user_roles!left(role_name)`. No emergency columns exist.
3. **Encryption at rest** , `contact_number` and `address` are encrypted before write and decrypted on
   read. An emergency phone is comparable PII and would have to follow the same path.

So server-side persistence is a real piece of backend work (migration + validator + model + controller),
not a field addition.

### 2.4 One anti-pattern to avoid

`POST /api/sms/send-sms-code` and `POST /api/sms/verify-sms-code` exist and Twilio is already a
dependency , but that controller is purpose-built for MFA code verification, not arbitrary messaging.
**It must not be repurposed for SOS alert SMS.** A GPS-SMS feature needs its own endpoint with its own
authorisation and rate limiting.

---

## 3. React Native native calling capabilities

The mobile app is **Expo SDK ~54 / React Native 0.81.5**, with React Navigation (bottom-tabs, drawer,
stack), NativeWind, `react-native-paper`, AsyncStorage, `expo-secure-store` and `expo-haptics` already
installed. No new dependency is required for calling.

### 3.1 Recommended approach

```js
import { Linking } from "react-native";
await Linking.openURL(`tel:${telTarget}`);
```

This opens the **system dialer pre-filled**, and the user presses the call button. It is the direct
behavioural equivalent of the web's `window.location.href = 'tel:...'`, which matters , we want parity,
not a divergent mobile behaviour.

**It requires no permissions on either platform.**

### 3.2 Android specifics

- **`CALL_PHONE` is not needed and should not be requested.** It is a *dangerous* runtime permission,
  and it is only required to place a call **without** the dialer UI (`ACTION_CALL` rather than
  `ACTION_DIAL`). Requesting it adds a permission prompt, invites Play Store scrutiny, and can cause the
  app to be filtered out for non-telephony devices. It also removes the dialer's confirmation step,
  which for elderly users is a useful mis-tap safety net rather than an obstacle.
- **Android 11+ (API 30+) package visibility affects `canOpenURL`, not `openURL`.**
  `Linking.canOpenURL('tel:...')` rejects unless the manifest declares:
  ```xml
  <queries>
    <intent>
      <action android:name="android.intent.action.DIAL" />
      <data android:scheme="tel" />
    </intent>
  </queries>
  ```
  Because this is an Expo project using Continuous Native Generation, `AndroidManifest.xml` is
  regenerated by `expo prebuild` / `expo run:android`, so a hand edit would be wiped , it would need an
  `app.json` config or a config plugin.

  **Recommendation: skip `canOpenURL` altogether** and wrap `openURL` in `try/catch`. Fewer moving
  parts, no manifest change, and the catch block gives us the error handling we need anyway.

  > **Verification note:** this recommendation is reasoned from general React Native `Linking` docs and
  > Android package-visibility behaviour, not yet empirically confirmed against Expo SDK ~54 specifically.
  > Treat it as the working assumption for the build, but smoke-test `Linking.openURL('tel:...')` on a
  > physical device running Expo SDK ~54 on **Day 1 of the Sprint 2 build**, before the rest of the
  > calling flow (FAB, context, error handling) is built on top of it. If behaviour diverges from this
  > doc, the `<queries>` / `app.json` config-plugin path in this section becomes the fallback.

### 3.3 iOS specifics

- `tel:` opens the dialer with a native system confirmation prompt. No `Info.plist` entry needed for
  `openURL`.
- **Avoid `telprompt:`.** Several community snippets use it for iOS; it is an undocumented private
  scheme and carries App Store review risk. Plain `tel:` is correct.
- **`tel:` does not work in the iOS Simulator** , there is no dialer app. Acceptance testing must happen
  on a physical device.

### 3.4 Failure cases the build must handle

| Case | Handling |
|---|---|
| Device has no telephony (tablet, some emulators) | `openURL` rejects → show a clear "This device can't make phone calls" alert |
| Malformed / empty number after normalisation | Never attempt to dial; route the user to the contact editor (mirrors web) |
| User cancels the dialer | Nothing to do , no app-side state change |

Reuse the web's `toEmergencyTelHref` normalisation logic verbatim (strip spaces/parens/hyphens, preserve
leading `+`) so both platforms dial identically.

---

## 4. Mobile UI placement design

### 4.1 The decision: persistent floating button, not a tab

**The bottom tab bar is already full.** `src/navigation/MainTabs.jsx` defines six tabs , Home, Meals,
Recipes, Scan, AI Plan, Profile. A seventh tab would crush the labels and icons, which is actively
harmful for the elderly users this feature exists for. **Tab placement is rejected.**

A **persistent FAB** is recommended, and there is already a proven precedent in the codebase to copy.

### 4.2 Mirror the FloatingChatbot pattern exactly

`src/components/FloatingChatbot/FloatingChatbot.jsx` solved this problem already. The SOS button should
follow it point for point:

- **Mount in `src/navigation/AppNavigator.jsx`, inside `<NavigationContainer>` and after
  `<RootNavigator />`.** The existing code comments explain why: it shares the native view layer with
  `react-native-screens` and gets a higher z-order, so it stays visible above every screen.
- **Gate on `isAuthenticated`** from `useUser()` , `if (!isAuthenticated) return null;`. This matches
  both the chatbot and the web's `currentUser ? <ElderlyUtilityHub /> : null`, and it means SOS is
  correctly absent from the auth stack.
- **Wrapper `pointerEvents="box-none"`** so touches that miss the button pass through to the screen.

### 4.3 Positioning and collision

The chat FAB occupies `bottom: 100, right: 20` at 60×60 with `zIndex: 9999`. The SOS button must not
overlap it.

Place SOS **above** the chat FAB at approximately `bottom: 172, right: 20` (100 + 60 + 12px gap). That
reproduces the same visual relationship as the web, where the hub raises itself above the assistant
button. Use a **shared layout constant** for the offset , React Native has no `ResizeObserver`, so the
web's runtime measuring approach does not port and should not be attempted. Apply
`react-native-safe-area-context` insets so the button clears the tab bar and home indicator.

### 4.4 Button design for the target audience

- **Minimum 64×64** (deliberately larger than the 60×60 chat FAB) to signal priority and ease targeting.
- **Red fill** (`#B91C1C` / `#DC2626`) against the app's `#0B5FA5` primary, with a visible **"SOS" text
  label** , not an icon alone. Icon-only is a legibility risk for this audience.
- **Two visual states**, matching web semantics:
  - *Setup* (no contact saved) , muted/amber, label "Add SOS", opens the editor.
  - *Ready* (valid contact) , red, label "SOS", dials on tap.
- Scale with `useAccessibility().sh()` so it respects the app's font-size setting (which already
  defaults to `large` because the audience is elderly).
- `accessibilityRole="button"` with a state-dependent `accessibilityLabel`
  ("Call emergency contact Jane" vs "Add emergency contact") and an `accessibilityHint`.
- Optional: `expo-haptics` confirmation pulse on press, since it is already a dependency.

### 4.5 Secondary entry point

Add an **"Emergency Contact"** row to `SettingsScreen` in `AccountStack` (reachable via Profile tab →
Settings). This mirrors the web profile page's Emergency Contact Name / Phone fields and gives users a
discoverable place to edit the contact without going through the FAB. `src/components/common/BottomSheet.jsx`
already exists and is the natural container for the editor on both entry points.

### 4.6 First-run flow

0. **Cold start / loading state.** AsyncStorage reads are async (see 4.7), so on mount the FAB briefly
   has no resolved contact state. Render a third **Loading** state , visually neutral/muted, non-interactive,
   no "Add SOS" or "SOS" label , until the read resolves. This avoids a flash of *Setup* state
   incorrectly implying a saved contact was lost.
1. Authenticated user with no saved contact sees the FAB in *setup* state.
2. Tap → bottom sheet with Name + Phone, validated with the same 8–15 digit rule as web.
3. Save → persist to AsyncStorage → FAB flips to *ready* red "SOS".
4. Subsequent taps are one-tap dial, no intermediate screen , matching web.

### 4.7 Storage parity

Use AsyncStorage with the **same key and shape** as web (`nutrihelp_emergency_contacts_v1`, map keyed by
normalised user key) so a future backend sync ticket can migrate both platforms with one schema. Port
`normalizeEmergencyContactUserKey`, `sanitizeEmergencyContact`, `isEmergencyPhoneValid`,
`toEmergencyTelHref` and `hasEmergencyContact` into a mobile `src/utils/emergencyContactManager.js`.

Note AsyncStorage is async where `localStorage` is sync, so the mobile module returns promises and the
button needs a loading state on mount. The web's `CustomEvent` broadcast has no RN equivalent , use a
small React context (following `AccessibilityContext`) to keep the FAB and the settings row in sync.

---

## 5. Gaps vs the Sprint 2 roadmap ambition

**This ticket scopes a basic single-contact port only.** Everything below is real roadmap ambition that
is explicitly **out of scope** for the FE-T2-12 build, with the reason recorded so the estimate is not
mistaken for the full vision.

| # | Ambition | Why it is later work |
|---|---|---|
| 1 | **Multiple emergency contacts** | Web and this port both store exactly one contact per user (`map[userKey] = { name, phone }`). Supporting several needs an array schema, list management UI, and ordering , plus a migration for existing single-contact records. |
| 2 | **Sequential escalation** (contact 1 no answer → contact 2) | **Not achievable with `Linking.openURL`.** Handing off to the system dialer means the app cannot observe call state. Detecting "no answer" needs `READ_PHONE_STATE` on Android and CallKit on iOS (which Apple heavily restricts), or a server-side dialer such as Twilio Programmable Voice. Needs its own spike before it can be estimated. |
| 3 | **GPS location SMS** | Needs `expo-location` (a new dependency) plus `ACCESS_FINE_LOCATION` and `NSLocationWhenInUseUsageDescription`. Delivery is then either an `sms:` deep link , which still requires the user to press send, so it is not automatic , or a new backend Twilio endpoint. The existing `/api/sms/*` routes are MFA-only and must not be reused (see 2.4). |
| 4 | **Backend persistence / cross-device sync** | No columns, validator fields or endpoints exist (Section 2). Requires a Supabase migration, AES-GCM encryption matching `contact_number`, validator and model updates, and a decision on whether web migrates its `localStorage` records. **Backend ticket.** Until then the contact is device-local and is lost on reinstall or device change , this limitation should be stated in the UI copy. |
| 5 | **Senior Mode / TTS parity** | Web bundles SOS with a Senior Mode toggle and TTS controls in one hub. Mobile has font scaling (`AccessibilityContext`) and `expo-speech` but no equivalent hub. Out of scope; SOS ships standalone. |
| 6 | **Web dead-code cleanup** | The unmounted `EmergencySOSButton.jsx` duplicates the hub's SOS logic (see 1.6). Separate web-side housekeeping ticket. |

---

## 6. Sprint 2 build ticket

> Copy the section below into the tracker as the buildable Sprint 2 ticket.

### FE-T2-13 , Port SOS emergency calling to mobile (single contact)

**Repo:** `NutriHelp-App-2026`
**Depends on:** FE-T2-12 (this scope)
**Blocked by:** nothing , deliberately scoped to require no backend change
**Estimate driver:** ~1 utility module, ~1 FAB component, ~1 bottom-sheet editor, ~1 context, 2 mount points

#### Description

Give the mobile app the SOS emergency calling capability that web already has: save one trusted contact,
then dial that contact from a persistent one-tap button. Behaviour must match web. Persistence is
device-local via AsyncStorage; server-side sync is a separate backend ticket.

#### Scope

**In scope**

- `src/utils/emergencyContactManager.js` , AsyncStorage port of the web utility, same storage key
  (`nutrihelp_emergency_contacts_v1`) and same record shape
- A React context for contact state, following the `AccessibilityContext` pattern
- `src/components/EmergencySOS/EmergencySOSButton.jsx` , persistent FAB, including the Loading state
  defined in Section 4.6
- Bottom-sheet contact editor (Name + Phone), reusing `src/components/common/BottomSheet.jsx`
- Mount in `src/navigation/AppNavigator.jsx`, inside `NavigationContainer`, after `RootNavigator`
- "Emergency Contact" row in `SettingsScreen`
- Dial via `Linking.openURL('tel:...')`
- Day-1 smoke test of `Linking.openURL('tel:...')` on a physical device running Expo SDK ~54, per the
  verification note in Section 3.2, before the rest of the calling flow is built on top of it

**Out of scope** , see Section 5: multiple contacts, sequential escalation, GPS SMS, backend
persistence, Senior Mode/TTS parity.

#### Acceptance criteria

**Contact persistence**

1. An authenticated user with no saved contact sees the FAB in *setup* state labelled "Add SOS".
2. Tapping it opens a bottom sheet with Name and Phone inputs; the phone field uses a telephone keypad.
3. Phone validation accepts **8–15 digits** after non-digits are stripped; anything else shows
   `"Please enter a valid phone number (8-15 digits)."` and does not save.
4. Name is optional, trimmed, and capped at 80 characters.
5. A saved contact persists across a full app restart.
6. The record is written under key `nutrihelp_emergency_contacts_v1`, keyed by the normalised user key
   (`id || user_id || email`, lowercased and trimmed, falling back to `guest`) , byte-compatible with web.
7. Two different signed-in users on the same device each see only their own contact.
8. The contact can be edited and removed; removing returns the FAB to *setup* state.
9. On cold start, the FAB renders a neutral, non-interactive **Loading** state until AsyncStorage
   resolves , never a flash of "Add SOS" before a saved contact is confirmed present or absent.

**One-tap calling**

10. With a valid contact saved, the FAB is red and labelled "SOS".
11. A single tap opens the **system dialer pre-filled** with the saved number , verified on a **physical
    Android device and a physical iOS device** (the iOS Simulator cannot do this).
12. Number normalisation matches web: spaces, parentheses and hyphens stripped, a leading `+` preserved.
13. If the contact is somehow invalid or unnormalisable, the editor opens instead of a dial attempt.
14. On a device without telephony, the rejected `openURL` produces a clear
    "This device can't make phone calls" alert , never a silent failure or crash.
15. **No `CALL_PHONE` permission is declared or requested**, and no runtime permission prompt appears
    anywhere in the flow.

**Placement and visibility**

16. The FAB is visible on every authenticated screen across all six tabs and inside nested stacks.
17. The FAB is **not** rendered on the auth stack (login/signup).
18. The FAB does not overlap the FloatingChatbot FAB; it sits above it with a consistent gap.
19. Touches that miss the FAB reach the content underneath (`pointerEvents="box-none"`).
20. The FAB respects safe-area insets and never sits under the tab bar or home indicator.
21. The Profile → Settings → "Emergency Contact" row opens the same editor and stays in sync with the
    FAB state without needing an app restart.

**Accessibility**

22. Touch target is at least 64×64.
23. `accessibilityRole="button"` is set, and `accessibilityLabel` reflects state , "Call emergency
    contact &lt;name&gt;" when ready, "Add emergency contact" when in setup.
24. The button and its label scale correctly at all three `FONT_SIZE_OPTIONS` settings (normal, large,
    extra large) with no clipping or overlap.
25. Contrast of the red fill against white and dark themes meets WCAG AA for large text.

**Quality**

26. Unit tests for the utility module cover validation boundaries (7, 8, 15 and 16 digits), `tel:`
    normalisation including the `+` case, user-key normalisation and the guest fallback.
27. The editor copy states that the contact is stored on this device only , setting the expectation
    until backend sync ships.
28. No regression in the FloatingChatbot's position or tap behaviour.

#### Test notes

- `tel:` cannot be exercised in the iOS Simulator; criteria 11 requires physical devices.
- Verify criterion 14 on a Wi-Fi-only tablet or an emulator without telephony.
- Confirm no `AndroidManifest.xml` `<queries>` change is needed, which holds as long as the
  implementation avoids `Linking.canOpenURL` (Section 3.2) , and confirm this against the Day-1 smoke
  test outcome, not just the doc's assumption.

---

## Appendix , evidence trail

| Claim | Source |
|---|---|
| Persistence is localStorage-only | `Nutrihelp-web/src/utils/emergencyContactManager.js` |
| Dial via `window.location.href` | `ElderlyUtilityHub.jsx:166`, `EmergencySOSButton.jsx:70` |
| Hub mounted for authed users only | `Nutrihelp-web/src/App.js:105` |
| Emergency contact not sent to API | `userprofile.jsx:2145-2152` |
| No backend emergency support | Repo-wide search of `Nutrihelp-api`; only `services/errorLogService.js` matches |
| Profile routes and validation | `routes/userprofile.js`, `routes/profile.js`, `validators/userProfileValidator.js` |
| `users` columns | `model/getUserProfile.js`, `model/updateUserProfile.js` |
| Six tabs already present | `NutriHelp-App-2026/src/navigation/MainTabs.jsx` |
| FAB precedent and mount rationale | `src/components/FloatingChatbot/FloatingChatbot.jsx`, `src/navigation/AppNavigator.jsx` |
| Mobile stack versions | `NutriHelp-App-2026/package.json` (Expo ~54, RN 0.81.5) |
| Font scaling defaults to large | `src/context/AccessibilityContext.jsx` |
| `tel:` needs no permission; `CALL_PHONE` only for dialer-less calls | React Native `Linking` docs; Android `Manifest.permission` reference |
| `canOpenURL` skip not yet verified against Expo SDK ~54 | Recommendation reasoned from RN/Android docs; scheduled for Day-1 Sprint 2 smoke test (Section 3.2) |
| FAB cold-start loading state | Added per review feedback; see Section 4.6, item 0 |
