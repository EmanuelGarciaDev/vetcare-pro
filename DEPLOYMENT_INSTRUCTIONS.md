
# VetCare Pro - Deployment Instructions

## Quick Deploy to Vercel

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to production:
   ```bash
   vercel --prod
   ```

4. Set environment variables in Vercel dashboard:
   - MONGODB_URI
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_URL (use your Vercel domain)
   - NEXTAUTH_SECRET

## Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

## Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://your-cluster-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
```

## Post-Deployment Checklist

- [ ] Test Google OAuth login
- [ ] Verify database connection
- [ ] Test appointment booking flow
- [ ] Check all API endpoints
- [ ] Validate mobile responsiveness
- [ ] Test error handling

## Monitoring

Set up monitoring for:
- API response times
- Database connection health
- Authentication success rates
- User booking completion rates
