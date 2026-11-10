# Rafiq Client

This folder contains the React/Vite single-page application. The full project overview, environment setup, test commands, screenshots, and architecture map are in the root [README](../README.md) and [Developer Guide](../DEVELOPER_GUIDE.md).

From this directory:

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Use `npm run lint` for ESLint and `npm run build` for the Vite production bundle. The development server proxies `/api` to the backend on `http://localhost:5000`.
