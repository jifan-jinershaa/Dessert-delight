# Deploying Dessert Delight (Render + MongoDB Atlas)

The Express server serves both the API and the website (`public/`), so you deploy **one** service.

## 1. Create the database (MongoDB Atlas, free)
1. Sign up at https://www.mongodb.com/cloud/atlas and create a free **M0** cluster (pick a region near your users, e.g. Mumbai/Singapore).
2. **Database Access** → Add a user with a password (use letters/numbers only to avoid URL-encoding issues).
3. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**. Render's free tier has no fixed IP.
4. **Connect → Drivers** → copy the connection string and add the database name:
   `mongodb+srv://USER:PASSWORD@cluster0.xxxxx.mongodb.net/dessert_delight?retryWrites=true&w=majority`

## 2. Push the code to GitHub
```bash
git add .
git commit -m "Production-ready backend and deployment config"
git push origin main
```
(`.env` is git-ignored, so your secrets are not uploaded.)

## 3. Deploy on Render
1. Sign up at https://render.com with GitHub.
2. **New → Blueprint** → select your repo. Render reads `render.yaml`.
3. When prompted, paste your Atlas string as `MONGODB_URI`. `SESSION_SECRET` is generated automatically.
4. Click **Apply**. After the build, your site is live at `https://dessert-delight.onrender.com` (or similar).

Prefer clicking through manually? **New → Web Service**: Build `npm install`, Start `npm start`, Health Check Path `/api/health`, and set env vars `NODE_ENV=production`, `MONGODB_URI`, `SESSION_SECRET`.

## 4. Verify
- Open `https://<your-app>.onrender.com/api/health` → should show `"database":"connected"`.
- Register an account, place an order, then check Atlas → Browse Collections (`users`, `orders`, `sessions`).

## Notes
- Free Render services sleep after ~15 minutes idle; the first visit afterwards takes a little while to wake up.
- Every `git push` to `main` redeploys automatically.
- Logs: Render dashboard → your service → Logs.
