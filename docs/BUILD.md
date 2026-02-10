# Build and Local Setup

Requirements
- Node.js (LTS)
- npm

Install
- npm install

Environment variables
Required for most features:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- NEXT_PUBLIC_SITE_URL

Email (guardian codes):
- RESEND_API_KEY
- RESEND_FROM

Stripe:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_PRICE_ID

Local dev
- npm run dev

Build
- npm run build

Supabase setup
Run SQL files in Supabase SQL editor (once per project):
- docs/seed-maths-v1.sql
- docs/workbooks.sql
- docs/guides.sql
- docs/notes-flashcards.sql
- docs/user-settings.sql
- docs/dashboard-widgets.sql
- docs/achievements.sql
- docs/support-chat.sql
- docs/progress-comments.sql
- docs/guardian.sql
- docs/activity-tracking.sql
- docs/exam-resources.sql
- docs/app-settings.sql

Storage buckets
Create buckets in Supabase Storage:
- guides (public read or signed URLs)
- workbooks
- exam-mocks

Common local issues
- "Bucket not found": create the bucket in Supabase Storage.
- "Email not configured": set RESEND_API_KEY and RESEND_FROM.
