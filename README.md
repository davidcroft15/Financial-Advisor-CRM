# Financial CRM for Independent Financial Services Business

A comprehensive Customer Relationship Management (CRM) system specifically designed for solo financial advisors and financial planners. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features

### Core CRM Features
- **Client Management**: Add, edit, and archive clients with comprehensive personal and financial details
- **Task & Interaction Tracking**: Log calls, emails, meetings with timeline view
- **Scheduling**: Google Calendar and Outlook integration for appointment booking
- **Communication**: Email and SMS integration for client communication
- **Financial Planning Tools**: Goal tracking, asset allocation visualization, financial summaries
- **Document Management**: Secure document storage with client organization
- **Compliance & Security**: Row-level security, data encryption, regulatory compliance exports
- **Dashboard**: Overview of practice metrics, upcoming meetings, and client alerts

### API Integrations
- **Plaid API**: Connect financial accounts (banking, investments, loans)
- **Google Calendar API**: Sync meetings and appointments
- **Microsoft Outlook Calendar API**: Cross-platform calendar integration
- **Gmail API & Outlook Mail API**: Client email integration
- **Twilio API**: SMS reminders and communication
- **OpenAI API**: AI-powered email drafting and meeting summaries
- **Stripe API**: Client invoicing and payment processing

### Automation Features
- Auto-generate welcome emails for new clients
- Automated meeting reminders via SMS
- Weekly digest emails for practice updates
- Automatic document organization
- Smart task creation from interactions

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **UI**: Tailwind CSS + shadcn/ui components + Lucide Icons
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Row Level Security)
- **Deployment**: Vercel (frontend) + Supabase hosting (backend)
- **Authentication**: Supabase Auth (Google + Email/Password)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- API keys for integrations (see API Setup section)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd financial-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables (see Environment Variables section below).

4. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
   - Get your project URL and anon key from Settings > API

5. **Start the development server**
   ```bash
   npm start
   ```

The application will open at `http://localhost:3000`.

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Supabase Configuration
REACT_APP_SUPABASE_URL=your_supabase_url_here
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# API Keys
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

## API Setup

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and anon key
3. Run the SQL schema from `supabase-schema.sql` in the SQL editor
4. Enable Google OAuth in Authentication > Providers

### 2. Plaid API Setup
1. Sign up at [plaid.com](https://plaid.com)
2. Create a new application
3. Get your Client ID and Secret from the dashboard
4. Use sandbox environment for development

### 3. Google APIs Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google Calendar API and Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs

### 4. Twilio Setup
1. Sign up at [twilio.com](https://twilio.com)
2. Get your Account SID and Auth Token from the console
3. Purchase a phone number for SMS

### 5. OpenAI Setup
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add credits to your account

### 6. Stripe Setup (Optional)
1. Sign up at [stripe.com](https://stripe.com)
2. Get your publishable key from the dashboard
3. Set up webhooks for payment processing

## Database Schema

The application uses the following main tables:

- **advisors**: Financial advisor information
- **clients**: Client personal and financial details
- **interactions**: Log of all client communications
- **tasks**: Task management with deadlines
- **appointments**: Meeting scheduling
- **documents**: File storage and organization
- **financial_goals**: Client financial objectives

All tables have Row Level Security (RLS) enabled to ensure advisors can only access their own data.

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Supabase)
- Database and authentication are hosted on Supabase
- Storage is handled by Supabase Storage
- No additional backend deployment needed

## Security Features

- **Row Level Security**: Database-level access control
- **Data Encryption**: All sensitive data encrypted at rest
- **Secure File Storage**: Documents stored with proper access controls
- **API Key Management**: Secure handling of third-party API keys
- **Authentication**: Multi-factor authentication support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation in the `/docs` folder
- Review the API integration guides

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting and analytics
- [ ] Integration with more financial data providers
- [ ] Automated compliance reporting
- [ ] Client portal for self-service
- [ ] Advanced AI features for financial planning