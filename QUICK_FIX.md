# 🚨 QUICK FIX: Set Environment Variables in Render

## The Problem
Your backend is failing because environment variables are not set in Render.

## The Solution (2 minutes)

### Step 1: Open Render Dashboard
👉 **Go to:** https://dashboard.render.com/

### Step 2: Select Your Service
Click on your backend service name (should be something like "betticsbackend")

### Step 3: Go to Environment Tab
Click **"Environment"** in the left sidebar menu

### Step 4: Add These 3 Variables

Click **"Add Environment Variable"** three times and add:

#### Variable 1:
```
Key: USR_NAME
Value: dbAdmin
```

#### Variable 2:
```
Key: PSS_WORD  
Value: $!e6vZ58eC*K7.*
```

#### Variable 3:
```
Key: CLU
Value: serverfe.qz1jw
```

⚠️ **IMPORTANT for CLU:** Use only `serverfe.qz1jw` (no `.mongodb.net`)

### Step 5: Save
Click **"Save Changes"** at the bottom

### Step 6: Wait
Render will automatically redeploy. Check the **"Logs"** tab - you should see:
```
✅ Servidor corriendo en puerto 3010
```

---

## ✅ That's It!

After setting these 3 variables, your backend will start successfully.

---

## Need Help?

If you're still having issues:
1. Double-check for typos in variable names (they're case-sensitive)
2. Make sure there are no spaces before/after the values
3. Verify CLU doesn't include `.mongodb.net`
4. Wait a few seconds for Render to redeploy

---

**Note:** The values shown above are from your dev.env file. For production, consider using separate, more secure credentials.

