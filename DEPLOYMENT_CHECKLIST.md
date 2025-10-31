# Deploy Al-Sha'er Family Website — checklist

## 1️⃣ MongoDB Atlas
- [ ] Sign up at https://www.mongodb.com/cloud/atlas
- [ ] Create a free M0 cluster
- [ ] Add a DB user in Database Access (Atlas → Security → Database Access)
- [ ] Set network access to 0.0.0.0/0 (or your Render IP) in Network Access
- [ ] Copy the connection string from Database → Connect → Drivers

## 2️⃣ Render.com environment
- [ ] https://dashboard.render.com → select the service
- [ ] Settings → Add environment variables:
  ```
  MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/alshaer-family?retryWrites=true&w=majority
  JWT_SECRET=use-a-very-long-random-string-here
  ADMIN_USERNAME=admin
  ADMIN_EMAIL=admin@alshaerfamily.com
  ADMIN_PASSWORD=YourSecurePassword123!
  NODE_ENV=production
  ```
- [ ] Save Changes
- [ ] Redeploy/Manual Deploy

## 3️⃣ Verify deployment
- [ ] Visit https://alshaerfamily.onrender.com
- [ ] Open https://alshaerfamily.onrender.com/admin/login
- [ ] Login: `admin` / `YourSecurePassword123!`

## 4️⃣ Optional: seed data
- [ ] Open the Render console or SSH shell
- [ ] Run:
  ```bash
  cd server
  node scripts/initializeData.js
  ```

## Common issues
- Login fails → Check `MONGODB_URI` and `JWT_SECRET`
- No admin user → Delete the service, set env vars, redeploy
- Build errors → Confirm `Build Command` and `Start Command` in Settings
- CORS → Allow the Render domain in the CORS config

## Default credentials
- Username: `admin`
- Password: (as set in `ADMIN_PASSWORD`; default `AlShaer2024!`)
