#!/usr/bin/env node

/**
 * VetCare Pro - Production Deployment Script
 * Prepares the application for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 VetCare Pro - Production Deployment Preparation\n');

// Check if required files exist
const requiredFiles = [
  '.env.local',
  'package.json',
  'next.config.ts',
  'src/app/layout.tsx'
];

console.log('📋 Pre-deployment Checklist:\n');

// 1. Check required files
console.log('1. Checking required files...');
let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// 2. Check environment variables
console.log('\n2. Checking environment variables...');
require('dotenv').config({ path: '.env.local' });

const requiredEnvVars = [
  'MONGODB_URI',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET'
];

let allEnvVarsSet = true;
requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`   ✅ ${envVar}`);
  } else {
    console.log(`   ❌ ${envVar} - NOT SET`);
    allEnvVarsSet = false;
  }
});

// 3. Check package.json scripts
console.log('\n3. Checking build configuration...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

if (packageJson.scripts.build) {
  console.log('   ✅ Build script configured');
} else {
  console.log('   ❌ Build script missing');
}

if (packageJson.scripts.start) {
  console.log('   ✅ Start script configured');
} else {
  console.log('   ❌ Start script missing');
}

// 4. Generate deployment instructions
console.log('\n4. Generating deployment instructions...');

const deploymentInstructions = `
# VetCare Pro - Deployment Instructions

## Quick Deploy to Vercel

1. Install Vercel CLI:
   \`\`\`bash
   npm i -g vercel
   \`\`\`

2. Login to Vercel:
   \`\`\`bash
   vercel login
   \`\`\`

3. Deploy to production:
   \`\`\`bash
   vercel --prod
   \`\`\`

4. Set environment variables in Vercel dashboard:
   - MONGODB_URI
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - NEXTAUTH_URL (use your Vercel domain)
   - NEXTAUTH_SECRET

## Manual Deployment

1. Build the application:
   \`\`\`bash
   npm run build
   \`\`\`

2. Start production server:
   \`\`\`bash
   npm start
   \`\`\`

## Environment Variables for Production

\`\`\`env
MONGODB_URI=mongodb+srv://your-cluster-url
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
\`\`\`

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
`;

fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', deploymentInstructions);
console.log('   ✅ Deployment instructions generated');

// 5. Final status
console.log('\n🎯 Deployment Readiness Assessment:\n');

if (allFilesExist && allEnvVarsSet) {
  console.log('✅ READY FOR PRODUCTION DEPLOYMENT!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run build` to test production build');
  console.log('2. Deploy using Vercel CLI or your preferred platform');
  console.log('3. Configure environment variables in production');
  console.log('4. Test the deployed application');
  console.log('\n📚 See DEPLOYMENT_INSTRUCTIONS.md for detailed steps');
} else {
  console.log('❌ NOT READY - Please fix the issues above');
}

console.log('\n🏆 VetCare Pro deployment preparation complete!');
