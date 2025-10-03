# Setting Up Real Admin User

## Option 1: Create a Real Admin User (Recommended)

1. **Go to your Supabase Dashboard**:
   - Visit: https://supabase.com/dashboard
   - Select your project
   - Go to Authentication > Users

2. **Create a new user**:
   - Click "Add user"
   - Enter email: `your-admin@example.com`
   - Enter password: `your-secure-password`
   - Click "Create user"
   - **Copy the User ID** (you'll need this)

3. **Add admin record to database**:
   - Go to SQL Editor in Supabase
   - Run this SQL (replace with your actual values):

```sql
INSERT INTO public.advisors (user_id, email, first_name, last_name, role, is_active)
VALUES (
  'c4558156-6db2-432d-be3d-c19a4953e809', -- Replace with the User ID from step 2
  'davidcroft13@yahoo.com', -- Replace with the email from step 2
  'YourFirstName',
  'YourLastName',
  'admin',
  TRUE
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();
```

4. **Test the login**:
   - Go to your app: http://localhost:3000
   - Click "Login" > "Admin Login"
   - Use your real credentials

## Option 2: Use Test Credentials (Current)

The test credentials (`admin@test.com` / `admin123`) will work but won't show live data from Supabase. This is useful for testing the interface but not for real data.

## What This Fixes

- ✅ **Live data from Supabase** - All components will fetch real data
- ✅ **Proper authentication** - Real user session
- ✅ **Data persistence** - Changes will be saved to database
- ✅ **Security** - Proper user authentication flow

## Next Steps

After setting up a real admin user, you should see:
- Real client data in the Clients tab
- Real calendar events in the Calendar tab
- Real consultation requests in the Consultations tab
- All data properly synced with Supabase
