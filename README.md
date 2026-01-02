# WebApiPeople UI — Frontend (React + TypeScript + Vite)

UI for the People Catalog API:
- Create / Read / Update / Delete
- Pagination + Search + Active filter
- Professional UX with:
  - Skeleton loaders
  - Clear success/error notifications
  - Field validation + inline form errors
  - Consistent final state after repeated actions

---

## Tech Stack

- React + TypeScript (Vite)
- Ant Design (UI)
- TanStack Query (data fetching + caching)
- Axios (HTTP)

---

## Requirements

- Node.js (LTS recommended)
- Backend running locally OR deployed to AWS

---

## Setup

### 1) Install dependencies
```bash
npm install
```

### 2) Configure API base URL
Create `.env`:

**Local backend (It depends on your local port)**
```env
VITE_API_BASE_URL=http://localhost:44332
```

**AWS (API Gateway)**
```env
VITE_API_BASE_URL=https://y53g8h1gx4.execute-api.us-east-1.amazonaws.com/Prod
```

---

## Run locally
```bash
npm run dev
```

Vite runs at:
- `http://localhost:5173`

---

## Notes (CORS)
If you run frontend locally and backend locally, ensure CORS allows:
- `http://localhost:5173`

If backend is in AWS, ensure CORS allows your frontend domain (Amplify).

---

## UX Behavior (important for the technical test)
- List uses TanStack Query caching and keeps previous data while fetching (no flicker)
- Skeleton is shown on initial load
- Save/Update shows loader in the form and on the primary button
- Inactive rows:
  - show a red `INACTIVE` tag
  - hide Edit/Delete actions
- Phone column:
  - shows a warning tag if phone is missing

---

## Build for production
```bash
npm run build
npm run preview
```

---

## (Optional) Deploy to AWS Amplify
- Connect this repository in Amplify
- Set build command: `npm ci && npm run build`
- Set output directory: `dist`
- Set environment variable: `VITE_API_BASE_URL=...`
