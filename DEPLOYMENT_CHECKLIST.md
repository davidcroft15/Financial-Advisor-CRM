# Vercel Deployment Checklist

## Pre-Deployment ✅
- [x] Code is committed to GitHub
- [x] Build works locally (`npm run build`)
- [x] All features tested locally
- [x] Environment variables documented

## Step 1: Deploy to Vercel
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Sign in with GitHub
- [ ] Click "New Project"
- [ ] Import repository: `davidcroft15/Financial-Advisor-CRM`
- [ ] Configure:
  - Framework: Create React App
  - Root Directory: `financial-crm`
  - Build Command: `npm run build`
  - Output Directory: `build`

## Step 2: Environment Variables
Set these in Vercel Dashboard → Project Settings → Environment Variables:

### Required:
- [ ] `REACT_APP_SUPABASE_URL` = your_supabase_url
- [ ] `REACT_APP_SUPABASE_ANON_KEY` = your_supabase_anon_key

### Optional (for future features):
- [ ] `REACT_APP_PLAID_CLIENT_ID` = your_plaid_client_id
- [ ] `REACT_APP_PLAID_SECRET` = your_plaid_secret
- [ ] `REACT_APP_PLAID_ENV` = sandbox
- [ ] `REACT_APP_GOOGLE_CLIENT_ID` = your_google_client_id
- [ ] `REACT_APP_GOOGLE_API_KEY` = your_google_api_key
- [ ] `REACT_APP_TWILIO_ACCOUNT_SID` = your_twilio_account_sid
- [ ] `REACT_APP_TWILIO_AUTH_TOKEN` = your_twilio_auth_token
- [ ] `REACT_APP_TWILIO_PHONE_NUMBER` = your_twilio_phone_number
- [ ] `REACT_APP_OPENAI_API_KEY` = your_openai_api_key
- [ ] `REACT_APP_STRIPE_PUBLISHABLE_KEY` = your_stripe_publishable_key

## Step 3: Supabase Configuration
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Add Vercel domain to Site URL: `https://your-app-name.vercel.app`
- [ ] Add Vercel domain to Redirect URLs: `https://your-app-name.vercel.app/**`

## Step 4: Test Deployment
- [ ] Landing page loads correctly
- [ ] Consultation request form works
- [ ] Form submission saves to database
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] All CRM features accessible
- [ ] Mobile responsive design works

## Step 5: Custom Domain (Optional)
- [ ] Add custom domain in Vercel
- [ ] Update Supabase Auth URLs with custom domain
- [ ] Test with custom domain

## Post-Deployment
- [ ] Share the live URL
- [ ] Monitor for any errors
- [ ] Set up monitoring/analytics if needed
- [ ] Document the live URL

## Your Vercel URL will be:
`https://financial-advisor-crm-xxx.vercel.app` (or your custom domain)
