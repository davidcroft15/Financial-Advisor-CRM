# Vercel Deployment Guide for Financial CRM

## Prerequisites
- ✅ GitHub repository is up to date
- ✅ Supabase project is configured
- ✅ Environment variables are ready

## Step 1: Prepare for Deployment

### 1.1 Create Production Environment File
Create a `.env.production` file (this will be used for deployment):

```bash
# Copy your .env.local content to .env.production
cp .env.local .env.production
```

### 1.2 Verify Build Works Locally
```bash
npm run build
```

If this fails, fix any issues before deploying.

## Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI (Optional but Recommended)
```bash
npm install -g vercel
```

### 2.2 Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository**: `davidcroft15/Financial-Advisor-CRM`
5. **Configure the project**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `financial-crm` (since your app is in a subfolder)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3 Set Environment Variables in Vercel

In the Vercel dashboard, go to your project → Settings → Environment Variables:

**Required Variables:**
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Optional Variables (for future features):**
```
REACT_APP_PLAID_CLIENT_ID=your_plaid_client_id
REACT_APP_PLAID_SECRET=your_plaid_secret
REACT_APP_PLAID_ENV=sandbox
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key
REACT_APP_TWILIO_ACCOUNT_SID=your_twilio_account_sid
REACT_APP_TWILIO_AUTH_TOKEN=your_twilio_auth_token
REACT_APP_TWILIO_PHONE_NUMBER=your_twilio_phone_number
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 2.4 Deploy
Click "Deploy" and wait for the build to complete.

## Step 3: Configure Supabase for Production

### 3.1 Update Supabase Auth Settings
1. **Go to your Supabase Dashboard**
2. **Authentication → URL Configuration**
3. **Add your Vercel domain** to:
   - **Site URL**: `https://your-app-name.vercel.app`
   - **Redirect URLs**: `https://your-app-name.vercel.app/**`

### 3.2 Update RLS Policies (if needed)
Make sure your Row Level Security policies work with the production domain.

## Step 4: Test Your Deployment

### 4.1 Test Public Features
- ✅ Landing page loads
- ✅ Consultation request form works
- ✅ Form submission saves to database

### 4.2 Test Admin Features
- ✅ Admin login works
- ✅ Admin dashboard loads
- ✅ Consultation requests are visible
- ✅ All CRM features work

## Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain
1. **Go to Vercel Dashboard → Domains**
2. **Add your custom domain**
3. **Update Supabase Auth URLs** with your custom domain

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check for TypeScript errors or missing dependencies
2. **Environment Variables Not Working**: Make sure they're set in Vercel dashboard
3. **Supabase Connection Issues**: Verify URLs and keys are correct
4. **CORS Errors**: Update Supabase Auth settings with correct domain

### Debug Steps:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables are loaded
4. Test Supabase connection

## Post-Deployment Checklist

- [ ] App loads without errors
- [ ] Landing page displays correctly
- [ ] Consultation request form works
- [ ] Admin login works
- [ ] All CRM features accessible
- [ ] Database operations work
- [ ] Mobile responsive design works
- [ ] Performance is acceptable

## Continuous Deployment

Once set up, Vercel will automatically deploy when you push to the `main` branch on GitHub.

## Support

If you encounter issues:
1. Check Vercel build logs
2. Check browser console
3. Verify Supabase configuration
4. Test locally first
