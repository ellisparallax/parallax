# COMMUNITY-SPEC — Identity, Discussion & Reputation (anonymous-first)

**Governing test (from the founder):** every feature must have a point. If identity, discussion, or reputation doesn't serve the mission — better sighting data, cleaner signal — it doesn't ship.

## 1. THE ACCOUNT ANSWER: identity only when identity has a point

**Reporting NEVER requires an account.** This is a hard rule and a stated differentiator. UAP witnesses face stigma; pilots, military personnel, and professionals will not attach identity to reports — anonymity produces MORE and BETTER data, which is the mission. (It's also the direct answer to Enigma's most-cited trust complaint: forced phone/email signup.) Anonymous reports get a device-local pseudonym (auto-generated callsign, e.g., "OBSERVER-K7") stored client-side only.

**Accounts exist, optionally, for exactly four things that inherently need identity:**
1. Sync/watch-regions across devices (PRO)
2. Earning and redeeming contributor rewards (barter needs a ledger)
3. Posting in case threads (accountability for speech, not for witnessing)
4. Paid subscriptions (payments create identity anyway)

Accounts are **pseudonymous callsigns forever** — no real names, no social login harvesting, email only (for auth + PRO pushes). The upgrade moment is contextual: "Want credit for this contribution? Claim a callsign." Never a signup wall.

## 2. DISCUSSION: case threads, not a forum — the forum is CALLED OUT and CUT

A Reddit-like general forum **fails the test.** r/UFOs already exists with millions of members; we will not out-Reddit Reddit, an empty forum reads as a dead app, and open boards in this topic space are a misinformation-moderation tar pit that would consume the project. **Not built.**

What has a point: **conversation anchored to evidence.**
- **Case threads** — one comment thread per sighting, incident, gallery exhibit, and document. Discussion happens where the artifact is (GitHub-issues model, not phpBB). A thread on DOC-001 arguing about the contrail altitude is signal; a "general discussion" board is noise.
- **SKYWATCH brief threads** — each nightly forecast is a post with its own thread ("anyone else see the 21:14 train?"). This is the daily heartbeat and the natural home for the community the founder wants — connected people, zero forum sprawl.
- **Event rooms** — live threads auto-opened by triangulation events (already specced), auto-archived after 48h into the case record.
- Sorting is chronological. **No upvotes on comments** (see §3). Report/flag + pseudonymous posting + hard moderation on doxxing and harassment. Thread participation requires a callsign; reading never does.

## 3. REPUTATION: track record, not karma

Upvote-karma systems are how Enigma got "low-quality posts rated high" — popularity scoring optimizes for sensational content, the exact failure mode of every UFO community ever. **No karma. No follower counts. No leaderboards of excitement.**

Instead, the **Observer Record**: a stats sheet of verifiable events, auto-computed, gameable only by doing the mission:
- Reports submitted / passed SKYCHECK vetting (ratio shown)
- Media contributions with intact metadata
- Triangulation events participated in
- **Prosaic Saves** — correctly identifying a mundane object (calling the Venus, catching the Starlink train). *This is the inversion no one else does: we reward being right, including being boringly right.* An observer with 40 prosaic saves and 2 residual unknowns is the most credible witness in the system — and the app says so.
- Badges tied to objective events only (First Vetted Report, Triangulation Contributor, 10 Prosaic Saves, Archive Citation — a document you surfaced got cited in a case thread).
Contributor barter (PRO/ARCHIVE months) pays out from the Observer Record ledger — which is the actual point of tracking any of it.

## 4. PUSH NOTIFICATIONS — placement locked
- **PRO:** area event alerts ("sighting reported within your radius"), custom conditions (radius, class, shape), real-time triangulation event invitations, nightly SKYWATCH forecast push. This is the subscription's daily-value spine.
- **FREE:** none by default. ONE strategic exception, founder's call: rare "national event" broadcasts (an NJ-wave-scale moment) — these are growth detonations and withholding them may cost more users than they convert. Recommend: free tier gets major-event pushes at 30-min delay; PRO gets them instantly. Urgency becomes the upsell without gating the historic moment entirely.

## 5. THE CUT/DEFER LIST (the test, applied to our own pile)
- **CUT: general forum** (above).
- **CUT: gallery's separate upload lane** — duplicates the report submission pipeline. One intake: submit report (± media) → SKYCHECK → vetted media flows to gallery automatically. One pipeline, one quality gate.
- **CUT: comment upvotes** everywhere.
- **DEFER: public API** (ARCHIVE tier) — building an API before researchers exist is waste; ship on demand signal.
- **DEFER: redaction-diff viewer** — vault full-text search is the ARCHIVE value; diffing is a v2 delight.
- **DEFER: SkyCast-style live sky broadcasting** — needs user density that doesn't exist yet.
- **DEMOTE: TACTICAL view mode** — keep only if it costs zero extra QA (same imagery codepath, one toggle); if it generates a single dedicated bug, cut to two modes. It's nostalgia, and nostalgia doesn't pass the test.
- **KEPT, and named as the amazing thing:** the loop. *See the world's record (globe) → stand inside one night of it (Witness View) → test your own sky against it (SKYCHECK) → add to the record (report).* Every surviving feature feeds that loop. Anything that doesn't, dies here.
