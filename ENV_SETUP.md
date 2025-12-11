# Environment Variables Setup

## Required Environment Variables

The backend requires the following environment variables to be set:

### MongoDB Configuration (REQUIRED)
```env
USR_NAME=your_mongodb_username
PSS_WORD=your_mongodb_password
CLU=your_cluster_name
```

**Important Notes:**
- `CLU` should be **only the cluster name** (e.g., `serverfe.qz1jw`)
- Do **NOT** include `.mongodb.net` in the CLU value
- The connection string will be constructed as: `mongodb+srv://${USR_NAME}:${PSS_WORD}@${CLU}.mongodb.net/...`

### Server Configuration
```env
PORT=3010
```

### JWT Configuration
```env
KEY_JWT=your_jwt_secret_key
```

### PayPal Configuration (if using)
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_URL=https://api-m.sandbox.paypal.com
PAYPAL_SUCESSS_URL=https://bettics-frontend.vercel.app/cuenta/suscripcion/exitoso
PAYPAL_ERROR_URL=https://bettics-frontend.vercel.app/cuenta/suscripcion/fallido
```

### SendGrid Configuration (if using)
```env
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Other Configuration
```env
COD_IS=IS
ADMIN_GRU=AC
ADMIN_DB=your_admin_db_id
```

---

## Setup Instructions

### Local Development
1. Create a `.env` file in the `backend` directory
2. Copy the variables above and fill in your values
3. Ensure `.env` is in `.gitignore` (it should be)

### Production (Render)
1. Go to your Render dashboard
2. Select your backend service
3. Go to "Environment" tab
4. Add each environment variable with its value
5. **Important:** Make sure `CLU` contains ONLY the cluster name, not the full domain

---

## Troubleshooting

### Error: `undefined.mongodb.net`
This means the `CLU` environment variable is not set or is empty.

**Solution:**
1. Check that `.env` file exists (local) or environment variables are set (production)
2. Verify `CLU` variable has no spaces before or after the value
3. Ensure `CLU` contains only the cluster name (e.g., `serverfe.qz1jw`), not the full URL

### Error: Connection timeout
- Verify MongoDB Atlas allows connections from your IP (or 0.0.0.0/0 for all IPs)
- Check that username and password are correct
- Verify the cluster is running

---

*Last updated: Current*

