# MaintainIQ — Frontend

React + Redux Toolkit frontend for the MaintainIQ hackathon backend: AI-powered QR maintenance and asset history platform.

## Stack

- **React 19 + Vite**
- **Tailwind CSS v4** — custom industrial "asset tag" design system, dark/light theme
- **Redux Toolkit + redux-persist** — all API calls go through slices/thunks; theme + session hint persisted to localStorage
- **React Router v7** — protected routes, role-based routes, public (no-login) QR scan routes
- **react-hook-form**, **axios** (cookie-based auth), **qrcode.react**, **lucide-react**, **react-hot-toast**

## Getting started

```bash
npm install
cp .env.example .env   # set VITE_API_URL to your backend, e.g. http://localhost:8000
npm run dev
```

The backend already whitelists `http://localhost:5173` in CORS, so run the frontend on the default Vite port for local dev.

## How auth works

The backend issues an **httpOnly cookie** on login/signup, so the frontend never touches the JWT directly. `axiosClient` sends every request with `withCredentials: true`. On app load, `AuthBootstrap` calls `GET /api/auth/profile` to verify the session and populate Redux — this is what `ProtectedRoute` waits on before deciding whether to redirect to `/login`.

Only `auth` (user + session flag) and `ui` (theme) are persisted to localStorage; everything else (assets, issues, dashboard, history) is re-fetched from the API on each visit so it never goes stale in storage.

## Route map

| Path | Access |
|---|---|
| `/` | Public landing page |
| `/scan/:assetCode` | Public — QR destination, view asset + report an issue |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | Public-only (redirects if already logged in) |
| `/app/dashboard` | Protected — role-aware (admin vs technician summary) |
| `/app/assets`, `/app/assets/:id` | Protected — both roles view; only admin can create/edit/retire |
| `/app/issues` | Protected — admin only |
| `/app/my-issues` | Protected — technician only |
| `/app/issues/:id` | Protected — both roles |

## Backend fixes applied

While wiring this frontend up, a handful of real backend bugs were found and fixed directly in the backend repo (see its `README.md` for the full list) — most importantly:

- Sign-up now actually saves a user's `role` (it was silently dropped before).
- The admin "all issues" endpoint no longer collapses to "my issues" due to a `"Admin"` vs `"admin"` casing mismatch.
- A missing `GROQ_API_KEY` no longer crashes the whole server — AI endpoints now fail gracefully with a `503`.
- `POST /api/ai/triage` is now public, matching the product spec's unauthenticated QR-scan report flow.
- Added `GET /api/users?role=technician` (admin-only), so this frontend can offer a real technician dropdown instead of asking for a raw MongoDB `_id`.
- Auth cookies now use `secure`/`sameSite` conditional on `NODE_ENV`, so login actually persists over plain `http://localhost` in local dev.
- **`createHistory` was called but never imported** in three controllers — reporting an issue, assigning a technician, changing status, and logging maintenance were all silently crashing with a 500 before this fix. This was the most important one.
- **Evidence upload is now fully wired end-to-end.** The public issue-report form and the technician's maintenance form both have a real photo/video picker (`EvidencePicker`) that uploads through `multer` → Cloudinary on the backend.

With those fixes in place, everything below just works — no more manual IDs, no more silent 500s, and photos actually attach to issues and maintenance records.

## Competition polish (Tier 1)

- **AI predictive health analysis** (`AssetHealthCard`) — on Asset Detail, generates a 0–100 health score with a circular gauge, failure probability, remaining-useful-life estimate, recurring-failure-pattern warning, and a plain repair-vs-replace recommendation. Backed by the new `GET /api/ai/asset-health/:assetId`.
- **Printable QR asset labels** (`PrintLabelModal`) — a real print-ready label (branding, asset name/code/location, status color, QR) instead of just a raw QR download, using browser print with scoped print-only CSS.
- **Visual asset history timeline** (`Timeline`) — replaced the plain list with a connected vertical timeline, auto-icon/color-coded by event type (created, reported, assigned, inspected, maintained, resolved, reopened, retired).
- **UI polish pass** — `framer-motion` page transitions between routes, staggered fade-in on dashboard stat cards and asset cards, hover-lift on interactive cards, tactile button press feedback, and an animated landing page hero.

## Competition polish (Tier 2)

- **Analytics dashboard** (`/app/analytics`, admin-only) — monthly maintenance cost trend, most problematic assets, technician performance, and issue breakdowns by category/status, all charted with `recharts`. Lazy-loaded on its own route chunk so it doesn't add weight to every user's initial page load.
- **Per-asset AI chat assistant** (`AssetChatWidget`) — a real conversational widget on Asset Detail, grounded only in that asset's own history (not a generic chatbot), backed by `POST /api/ai/asset-chat/:assetId`.
- **One-click AI PDF report** (`assetReportPdf.js`) — generates a branded PDF combining the asset summary, AI health analysis (if you've run one), and the full history table, via `jsPDF`. The PDF library is dynamically imported only when the button is clicked, so it never loads for people who don't use it.

## Notable frontend decisions

- **QR codes are generated client-side** (`qrcode.react`) from `${origin}/scan/{assetCode}` — the backend doesn't generate a QR image, so on asset creation the frontend sends that URL as `publicUrl`/`qrCode` and renders the QR from it everywhere.
- **"Report on behalf of a walk-in"**: the Asset Detail page links to the same public `/scan/:assetCode` report form. If a staff member is logged in, their session cookie carries over, so AI triage still works even though it's the "public" page.
- **Maintenance record creation resolves the issue** (per the backend's own logic), so the status dropdown on Issue Detail intentionally excludes "Resolved" — that transition only happens by logging a maintenance record.
# Maintainiq-Saas-Frontend
