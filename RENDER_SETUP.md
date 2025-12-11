# Render Deployment Setup Guide

## 🚨 CRITICAL: Environment Variables Must Be Set

Your backend is failing to start because required environment variables are missing.

## Step-by-Step Instructions to Fix

### 1. Log in to Render Dashboard
Go to: https://dashboard.render.com/

### 2. Select Your Backend Service
- Click on your backend service (should be named something like "betticsbackend")
- If you haven't created the service yet, create a new "Web Service"

### 3. Go to Environment Tab
- In your service dashboard, click on **"Environment"** in the left sidebar
- This is where you'll add all your environment variables

### 4. Add Required Environment Variables

Click **"Add Environment Variable"** for each of these:

#### Required Variables:

```
Key: USR_NAME
Value: [Your MongoDB username]
```

```
Key: PSS_WORD
Value: [Your MongoDB password]
```

```
Key: CLU
Value: [Your MongoDB cluster name]
```

**Important for CLU:**
- Use **ONLY** the cluster name (e.g., `serverfe.qz1jw`)
- Do **NOT** include `.mongodb.net` or the full URL
- Example: If your connection string is `mongodb+srv://user:pass@serverfe.qz1jw.mongodb.net/...`, then `CLU` should be `serverfe.qz1jw`

#### Additional Recommended Variables:

```
Key: PORT
Value: 3010
```

```
Key: KEY_JWT
Value: [Your JWT secret key]
```

#### Optional (if using PayPal):
```
Key: PAYPAL_CLIENT_ID
Value: [Your PayPal client ID]

Key: PAYPAL_CLIENT_SECRET
Value: [Your PayPal client secret]

Key: PAYPAL_URL
Value: https://api-m.sandbox.paypal.com
(or https://api-m.paypal.com for production)

Key: PAYPAL_SUCESSS_URL
Value: https://bettics-frontend.vercel.app/cuenta/suscripcion/exitoso

Key: PAYPAL_ERROR_URL
Value: https://bettics-frontend.vercel.app/cuenta/suscripcion/fallido
```

#### Optional (if using SendGrid):
```
Key: SENDGRID_API_KEY
Value: [Your SendGrid API key]
```

### 5. Save Changes
- After adding all variables, click **"Save Changes"**
- Render will automatically trigger a new deployment

### 6. Verify Deployment
- Go to the **"Logs"** tab
- You should see the application starting successfully
- The error messages about missing environment variables should be gone

---

## How to Find Your MongoDB Credentials

### If you have access to MongoDB Atlas:

1. Log in to MongoDB Atlas: https://cloud.mongodb.com/
2. Click on your cluster
3. Click **"Connect"**
4. Choose **"Connect your application"**
5. You'll see a connection string like:
   ```
   mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/...
   ```
6. Extract:
   - **USR_NAME**: The username part (e.g., `dbAdmin`)
   - **PSS_WORD**: The password part
   - **CLU**: The cluster name part (e.g., `serverfe.qz1jw`)

### If you don't have access:

Contact your team/admin to get:
- MongoDB username
- MongoDB password  
- MongoDB cluster name

---

## Quick Reference: Variable Names

| Variable | Description | Example |
|----------|-------------|---------|
| `USR_NAME` | MongoDB username | `dbAdmin` |
| `PSS_WORD` | MongoDB password | `your_password` |
| `CLU` | MongoDB cluster name (no .mongodb.net) | `serverfe.qz1jw` |
| `PORT` | Server port | `3010` |
| `KEY_JWT` | JWT secret key | `your_jwt_secret` |

---

## Troubleshooting

### Still getting errors after setting variables?

1. **Check for typos**: Variable names are case-sensitive
2. **Verify values**: Make sure there are no extra spaces
3. **Wait for redeploy**: Render redeploys automatically after saving
4. **Check logs**: Look at the logs tab to see current variable status

### Common Mistakes:

❌ **WRONG**: `CLU=serverfe.qz1jw.mongodb.net`  
✅ **CORRECT**: `CLU=serverfe.qz1jw`

❌ **WRONG**: `CLU= serverfe.qz1jw` (space before value)  
✅ **CORRECT**: `CLU=serverfe.qz1jw`

❌ **WRONG**: `USR_NAME` (missing underscore)  
✅ **CORRECT**: `USR_NAME`

---

## After Setup

Once all environment variables are set correctly, your deployment should show:

```
✅ Servidor corriendo en puerto 3010
```

Instead of the error messages about missing variables.

---

*Last updated: Current*

