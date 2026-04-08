# geniedose_

## Backend Firebase Authorization

The backend now supports Firebase-backed client authorization for secure API access.

Environment variables required:
- `FIREBASE_DATABASE_URL`
- `GOOGLE_APPLICATION_CREDENTIALS`
- `AUTH_ADMIN_API_KEY` (optional, used when registering new clients)

Routes:
- `POST /register-client`: register a new client record with `client_id` and `token`.
- `GET /verify-client`: verify active client authorization via `X-Client-ID` and `X-Auth-Token` headers.

Protected routes require:
- `X-Client-ID`
- `X-Auth-Token`
