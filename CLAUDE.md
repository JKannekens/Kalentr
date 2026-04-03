# CLAUDE.md

## Project

**Kalentr** — SaaS for freelancers to create microsites and manage bookings.

Focus: **simplicity, speed, great UX**

---

## Principles

- Simplicity first (setup in minutes)
- Fast, responsive UI
- Mobile-friendly
- Clean, minimal design (shadcn + Tailwind)
- Self-service (no support needed)

---

## Priority Order

1. Correctness
2. Simplicity
3. Performance
4. Developer speed

---

## Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind + shadcn/ui
- PostgreSQL + Prisma
- pnpm

---

## Architecture

- Prefer **server components**
- Use **server actions** for mutations
- No business logic in components → use `/services`
- Keep components small and focused

Structure:
- `/app` → routes
- `/components` → UI
- `/services` → business logic
- `/lib` → shared utils
- `/db` → Prisma

---

## Data Rules

- Store all dates in **UTC**
- Convert to user timezone in UI only
- Prevent double bookings
- Always scope data by `userId` (multi-tenant)

---

## Database

Entities:
- User
- Microsite
- Availability
- Booking

Rules:
- Use Prisma types
- Model relationships clearly
- Avoid over-normalization
- No raw SQL unless necessary

---

## Validation & Security

- Validate all input at the boundary (server actions)
- Never trust client input
- Sanitize user content
- Protect all routes/actions
- Never expose sensitive data

---

## Code

DO:
- Strict TypeScript
- Small, reusable functions
- Follow existing patterns

DON’T:
- Over-engineer
- Add unnecessary abstractions
- Mix UI + business logic

---

## UI

- Use shadcn as base
- Keep UI minimal
- Extract large Tailwind class blocks into components
- Stay consistent (spacing, typography)

---

## Performance

- Prefer server-side fetching
- Minimize client state
- Avoid unnecessary re-renders
- Lazy load when useful

---

## Errors

- Show user-friendly messages
- Log detailed errors server-side
- Never leak internal errors

---

## Naming

- Use clear names (`createBooking`, not `handleSubmit`)
- Avoid unclear abbreviations

---

## Scope

- Do not add features unless asked
- Stick to the task

---

## Testing

- Focus on booking + availability
- Keep tests simple

---

## Communication (Claude)

- Be concise and practical
- Ask if unsure before implementing
- Prefer production-ready code

Reply format:
Done. [one sentence summary]  
Changed: [FileName] - Lines [X-Y]

- No code blocks
- No explanations

---

## Optimize For

- Speed
- Clean architecture
- Multi-tenant scalability
- Great UX

---

## Anti-Goals

- No enterprise overengineering
- No microservices
- No complex state management

---

## Rule

- If in doubt: **simplify**
- “See FEATURES.md for active feature backlog and status tracking.”
Then all humans/agents know where to look.