# FEATURES.md

## 1. Auth + user onboarding
- [x] Email/password register, login
- [x] Forgot password + reset token
- [x] Email verification flow
- [x] Tenant creation after signup (onboarding)
- [ ] Improve UX: success / error states in forms
- [ ] Rate-limit auth actions (security)

## 2. Tenant + microsite basics
- [x] Tenant model, subdomain, businessName
- [x] Dashboard redirect logic (`/dashboard`, onboarding)
- [x] Public microsite URL formula (dev/prod)
- [ ] Theme settings and branding (logo, colors, copy)
- [ ] Custom domain support (future)

## 3. Services
- [x] Create/update/delete service in dashboard
- [x] List services (`/dashboard/services`)
- [ ] Service durations/prices/description in book page
- [ ] Category/tag for services

## 4. Availability
- [x] Weekly availability form
- [x] Persist availability per tenant
- [ ] Availability exceptions/holiday blocking
- [ ] “Time off” custom date ranges
- [ ] Multi-week schedule and pickup/lead-time rules

## 5. Booking flow (MVP)
- [ ] Public route: `/app/_tenant/[subdomain]/book/[serviceId]`
- [ ] Load service + availability + existing bookings
- [ ] Available slot generator (timezone-aware)
- [ ] Booking form (name/email/notes)
- [ ] Server action with:
  - validation (Zod)
  - user email + tenant scope
  - conflict check (same slot)
- [ ] Confirmation page/email
- [ ] Calendar invite add-on (ICS)

## 6. Appointments dashboard
- [ ] Appointment list + status (pending/confirmed/cancelled)
- [ ] Filter by upcoming/past/cancelled
- [ ] Manual appointment cancel/reschedule
- [ ] Backend tenant-scope data access enforcement
- [ ] Export CSV / integrate with external calendar

## 7. Notifications
- [ ] Booking confirmation email
- [ ] Reminder email cron:
  - 24h before
- [ ] Cancel/update notification email
- [ ] Email templates in `src/lib/email-templates.ts`

## 8. Data quality + safety
- [ ] Use strict `session.user.id` in queries (multi-tenant guard)
- [ ] Input validation at actions boundaries
- [ ] Handle race conditions in booking DB writes
- [ ] Edge-case slot fallback (no availability)
- [ ] Unit tests for availability + booking collision

## 9. Dashboard polish
- [ ] Counts on cards (services, appointments, availability)
- [ ] Graphs or calendar summary
- [ ] Settings page (`/dashboard/settings`) - tenant metadata
- [ ] Mobile UX improvements

## 10. Nice-to-have (later)
- [ ] Payment + deposit integrations
- [ ] Multi-lingual support

## “In progress” state method
- Use:
  - `- [ ]` backlog
  - `- [p]` in progress
  - `- [x]` done

