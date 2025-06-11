# Google OAuth Setup Instructions

## 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Click "Select a project" → "New Project"
3. Enter project name: "VetCare Pro"
4. Click "Create"

## 2. Enable Google+ API
1. Go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

## 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure the OAuth consent screen:
   - Choose "External"
   - App name: "VetCare Pro"
   - User support email: your email
   - Developer contact: your email
   - Save and continue through all steps

## 4. Configure OAuth Client
1. Application type: "Web application"
2. Name: "VetCare Pro Web Client"
3. Authorized JavaScript origins:
   ```
   http://localhost:3000
   ```
4. Authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
5. Click "Create"

## 5. Copy Credentials
1. Copy the "Client ID" and "Client Secret"
2. Update your .env.local file:
   ```
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   ```

## 6. Test Configuration
- Restart your Next.js development server
- Try logging in with Google
- Should redirect properly to dashboard

## Troubleshooting
- Make sure the redirect URI is exactly: `http://localhost:3000/api/auth/callback/google`
- No trailing slashes
- Use `http` not `https` for localhost
- Port must match your development server (3000)
