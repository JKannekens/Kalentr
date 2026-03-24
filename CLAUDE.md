# CLAUDE.md

## Project Overview

**Kalentr** is a SaaS platform that enables freelancers and small businesses to:

- Create a simple, customizable microsite
- Manage availability and appointments
- Share booking links with clients

The product focuses on **simplicity, speed, and great UX**, avoiding unnecessary complexity.

---

## Core Product Principles

- **Simplicity first** — users should set up their page in minutes
- **Fast interactions** — minimal loading, responsive UI
- **Mobile-friendly** — many users will manage bookings on mobile
- **Clean design** — leverage shadcn UI and Tailwind for consistency
- **Self-service** — users should not need support to get started

---

## Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Package Manager:** pnpm

---

## Architecture Guidelines

### General

- Prefer **server components** unless interactivity is required
- Use **server actions** for mutations when possible
- Keep business logic **out of components**, place it in services/lib
- Avoid fat components — keep them focused and small

### Suggested Structure

- `/app` → routes, layouts, server components
- `/components` → reusable UI components
- `/lib` → utilities, helpers, shared logic
- `/services` → business logic (appointments, users, availability)
- `/db` → Prisma client and database-related logic

---

## Database & Prisma

### Guidelines

- Use clear and explicit schema naming
- Always model relationships properly (User → Availability → Bookings)
- Avoid over-normalization — optimize for readability and queries

### Example Entities

- User
- Microsite (slug, branding, description)
- Availability (time slots, rules)
- Booking (date, duration, client info)

### DO

- Use Prisma types everywhere
- Handle edge cases (double bookings, timezone issues)

### DON'T

- Write raw SQL unless necessary
- Duplicate business logic outside services

---

## UI & Styling

### Principles

- Use **shadcn components as base**
- Keep UI minimal and clean
- Prioritize usability over flashy design

### Tailwind Guidelines

- Avoid long class chains → extract into components when needed
- Use consistent spacing and sizing
- Stick to a defined design system (colors, radius, typography)

---

## When Building Features

### Always Think:

- Can a freelancer understand this instantly?
- Is this the fastest way to complete the task?
- Can this be simplified further?

---

## Booking System Rules

- Prevent double bookings
- Handle timezones properly (store in UTC)
- Keep booking flow frictionless:
  - Select service
  - Pick time
  - Enter details
  - Confirm

---

## Code Guidelines

### DO

- Use strict TypeScript (no `any`)
- Write small, reusable functions
- Keep logic readable and predictable
- Follow existing patterns

### DON'T

- Over-engineer solutions
- Introduce unnecessary abstractions
- Mix UI and business logic

---

## Performance

- Prefer server-side data fetching
- Minimize client-side state
- Avoid unnecessary re-renders
- Lazy load where appropriate

---

## Security

- Validate all inputs (especially booking forms)
- Sanitize user-generated content
- Protect routes and actions properly
- Never expose sensitive data

---

## Testing (Optional but Recommended)

- Focus on critical flows:
  - Booking creation
  - Availability logic

- Keep tests simple and focused

---

## Communication Style (for Claude)

When assisting with this project:

- Be concise and practical
- Suggest improvements when relevant
- Avoid overcomplicating solutions
- Prefer production-ready code
- Ask questions if requirements are unclear

---

## What to Optimize For

- Developer speed
- Clean architecture
- Scalability (multi-tenant SaaS)
- Great user experience

---

## Anti-Goals

- No unnecessary enterprise patterns
- No premature microservices
- No overly complex state management

---

## Notes

Kalentr should feel:

- Effortless to use
- Fast and responsive
- Clean and modern

If in doubt: **simplify the solution.**
