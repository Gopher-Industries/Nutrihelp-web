# Assistant Widget Implementation + API Contract

Last updated: April 27, 2026

## 1. Delivered Scope

### UI / UX
- Floating assistant FAB + expandable chat panel.
- Message timeline with user/assistant bubbles, loading state, retry state, empty state.
- Clear-history action with confirmation.
- Mobile bottom-sheet behavior and accessibility support (`aria-busy`, keyboard/escape handling).
- Dedicated full-page assistant route at `/chat` with polished layout (same shared panel logic).

### Frontend Engineering
- Global assistant architecture via provider + reusable panel:
  - `src/context/assistant.context.jsx`
  - `src/components/assistant/AssistantPanel.jsx`
  - `src/components/assistant/AssistantWidget.jsx`
  - `src/components/assistant/AssistantWidget.css`
- Assistant API client integration:
  - `src/services/assistantApi.js`
- Trigger rewiring to open widget instead of redirect-only behavior:
  - `src/components/MainNavbar.js`
  - `src/components/SideMenu.js`
  - `src/routes/Home/Home.js`

---

## 2. File Ownership and Endpoint Usage

| File | Responsibility | Uses Endpoints |
|---|---|---|
| `src/services/baseApi.js` | API base URL normalization + auth header generation | Shared by all API modules |
| `src/services/assistantApi.js` | Assistant HTTP client wrapper + typed errors | `POST /chatbot/query`, `POST /chatbot/history`, `DELETE /chatbot/history` |
| `src/context/assistant.context.jsx` | Assistant state machine (history load, send, retry, clear, error mapping, mock mode) | Calls assistant API client methods |
| `src/components/assistant/AssistantPanel.jsx` | Chat UI panel (timeline, composer, quick prompts, retry/clear actions) | No direct HTTP (context only) |
| `src/components/assistant/AssistantWidget.jsx` | Global FAB + overlay + panel mount/unmount behavior | No direct HTTP (context only) |
| `src/routes/chat/ChatPage.jsx` | Dedicated full-page assistant route (`/chat`) | No direct HTTP (reuses panel/context) |
| `src/routes/chat/ChatPage.css` | Full-page `/chat` styling | N/A |

---

## 3. API Base, Auth, and Identity Contract

### Base URL
- Source env key: `REACT_APP_API_BASE_URL`
- Default when missing: `http://localhost:80`
- Normalized API base (frontend behavior):
  - if env already ends with `/api`, use as-is
  - otherwise append `/api`
- Effective assistant root path:
  - `${API_BASE_URL}/chatbot`
  - example default root: `http://localhost:80/api/chatbot`

### Headers
- Always sends: `Content-Type: application/json`
- Sends `Authorization: Bearer <token>` when a token exists in local/session storage.

### `user_id` Source
- Resolved from current session user object (first non-empty key in order):
  - `id`, `user_id`, `uid`, `sub`
- Sent in all assistant API payloads as `user_id` (string).

---

## 4. API Endpoint Contract (Recommended Backend Shape)

### 4.1 `POST /api/chatbot/query`

Purpose: send one user message and get one assistant reply.

Request body:
```json
{
  "user_id": "string",
  "query": "string"
}
```

Success response (recommended):
```json
{
  "reply": "string"
}
```

Accepted by current frontend (compatibility keys):
- String body response.
- Or object containing one of: `reply`, `response`, `message`, `msg`, `answer`, `output`, `text`.

Required data for a good UX:
- Non-empty assistant reply text.

---

### 4.2 `POST /api/chatbot/history`

Purpose: fetch chat history for one user.

Request body:
```json
{
  "user_id": "string"
}
```

Success response (recommended):
```json
{
  "history": [
    {
      "id": "m1",
      "role": "user",
      "text": "How can I reduce sugar intake?",
      "created_at": "2026-04-27T09:00:00Z"
    },
    {
      "id": "m2",
      "role": "assistant",
      "text": "Start with drinks and labels...",
      "created_at": "2026-04-27T09:00:02Z"
    }
  ]
}
```

Accepted by current frontend (compatibility shapes):
- Root array directly.
- Or object with array key: `history`, `messages`, `data`, or `items`.
- Array items can be:
  1. Flat message shape: `role` + text field (`text` / `message` / `content` / `reply` / `response` / `answer` / `msg`)
  2. Query/response pair shape:
     - `query`
     - one of `response`, `answer`, `reply`, `message`
     - optional timestamps (`created_at`, `response_time`, etc.)
  3. Raw string item (treated as assistant message).

Required data for a good UX:
- Message text fields should be non-empty.
- Role should be distinguishable (`user` vs assistant-like values).
- Timestamps should be ISO-8601 when available.

---

### 4.3 `DELETE /api/chatbot/history`

Purpose: clear all stored chat history for one user.

Request body:
```json
{
  "user_id": "string"
}
```

Success response (recommended):
```json
{
  "success": true,
  "message": "History cleared"
}
```

Current frontend behavior:
- Any HTTP 2xx is treated as success.
- Response body is optional for UI flow.

---

## 5. Error Contract

### Backend error payload (recommended)
```json
{
  "detail": "Human readable message"
}
```

Current frontend reads error text from first available key:
- `detail`, `message`, `error`, `msg`
- fallback: `"Assistant request failed."`

### Status mapping used by frontend
- `400`:
  - inline input validation error
  - assistant bubble: user should edit and resend
- `429`:
  - quota/rate-limit messaging
  - banner + retry guidance
- `502` / `503`:
  - upstream temporary unavailable
  - banner + retry guidance
- Other:
  - generic failure banner + retry option

---

## 6. Frontend Normalized Message Model

All inbound history and send/retry flows are normalized to:

```json
{
  "id": "string",
  "role": "user | assistant",
  "text": "string",
  "createdAt": "ISO datetime",
  "status": "ready | loading | error",
  "retryQuery": "string",
  "isRetryable": true
}
```

Notes:
- `status`, `retryQuery`, and `isRetryable` are UI control fields (not required from backend).
- History payload is transformed into this shape in `assistant.context.jsx`.

---

## 7. Runtime Modes

- Mock mode controlled by `.env`:
  - `REACT_APP_ASSISTANT_MOCK_MODE=true|false`
- When mock mode is `true`:
  - no network calls are required for assistant flow
  - history and responses are local/demo only

---

## 8. Validation Snapshot

- Build status: `npm run build` passes.
- Existing non-blocking repo warnings remain (pre-existing):
  - CRA/babel deprecation warning
  - `html2pdf.js` source-map warning
  - autoprefixer warning in unrelated CSS
