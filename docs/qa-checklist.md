# QA Checklist (V1)

## Student (not subscribed)
- Login works
- `/maths` content access as designed
- `/practice`, `/progress`, `/mastery` redirect to `/pricing`

## Student (subscribed)
- Checkout success
- Webhook delivery 200
- `profiles.is_subscribed = true`
- `profiles.stripe_status` reflects active/trialing
- `profiles.stripe_status_updated_at` updates on webhook/resync
- Premium routes accessible

## Student (override)
- Admin toggles `access_override = true`
- Premium routes accessible without Stripe

## Admin
- Always passes premium gate
- Can access admin pages
- Can create content
- Can edit/delete topics/lessons/questions
- Can toggle user override
- Billing audit page loads and resync works
