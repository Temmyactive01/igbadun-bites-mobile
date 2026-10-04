# Backlog

Known follow-ups for the app. Add new items at the top of "Open"; move them to "Done"
with the date and commit when finished.

## Open

### Homepage text lives in two places

- **Added:** 4 Oct 2026, accepted for now when the Shop tab was matched to the website
  (commit 4fe3c6b).
- **What:** The homepage's images come from the website, so they can't drift. Its *text* is
  a copy: `src/lib/site-content.ts` repeats the wording of the website's homepage
  components. That includes the hero, manifesto, chapter titles and blurbs, featured
  product name, our story, occasions, "how ordering works", footer and contact details.
  Each block names the website file it mirrors.
- **Risk:** Someone edits the wording on the website and the app keeps the old text. The
  contact details matter most (phone, WhatsApp, email), because a stale number there costs
  orders.
- **Until fixed:** Any change to that website text must also be made in
  `src/lib/site-content.ts`. The app only picks it up in a new app build.
- **Options to fix:**
  1. The website publishes the text as JSON at build time, and the app reads it the same
     way it reads `/product-images.json`. No database change; it updates after a website
     deploy.
  2. Move the text into a Supabase table that both read. Live edits for both, but it's a
     database change on production, so it needs agreeing first.
