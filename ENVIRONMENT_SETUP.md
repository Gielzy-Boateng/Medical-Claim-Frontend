# Environment Variables Setup

This guide explains how to set up environment variables for different environments (development and production).

## Local Development Setup

1. **Create a `.env.local` file** in the root directory:

   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local`** with your development backend URL:
   ```env
   VITE_API_BASE_URL=http://laravel-api-app.test
   ```

## Production Setup (Vercel)

### Option 1: Vercel Dashboard

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following environment variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-production-backend.com`
   - **Environment**: Production (and Preview if needed)

### Option 2: Vercel CLI

```bash
vercel env add VITE_API_BASE_URL
# Enter your production backend URL when prompted
```

## Environment Variables

| Variable            | Description          | Example                      |
| ------------------- | -------------------- | ---------------------------- |
| `VITE_API_BASE_URL` | Your backend API URL | `https://api.yourdomain.com` |

## How It Works

- **Development**: Uses the proxy configuration in `vite.config.js` to forward API calls to your local backend
- **Production**: Makes direct API calls to the URL specified in `VITE_API_BASE_URL`

## Testing Environment Variables

You can test if your environment variables are working by checking the browser console:

```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

## Important Notes

- Environment variables must start with `VITE_` to be exposed to the client-side code
- The `.env.local` file is ignored by git (for security)
- Always use HTTPS URLs in production
- Make sure your backend CORS settings allow requests from your Vercel domain
