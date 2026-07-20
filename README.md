# Table Tennis Scoreboard

A phone-first scoreboard for table tennis. Everything is stored in `localStorage` — no backend,
no accounts, works offline.

## Using it

- **Tap** a player's half to give them a point.
- **Swipe down** on their half to take a point back. If it was the point they just scored, the
  undo also un-does the game or match it won.
- **Serve** — the glowing dot marks who is serving. Tap the `SERVE` pill in the middle to switch.
  It never moves on its own.
- **Cog** (top right) — player names, 11 or 21 points, best of 3/5/7, and the reset actions.
- **Clock** (next to the cog) — every finished match, newest first, with the winner, the games
  tally and each game's final score.

Games are win-by-2: at 10-10 (or 20-20) play continues until someone leads by two. Game pips under
each name show games won out of the number needed to take the match.

A match is archived the moment it is won, and un-archived if you undo that winning point — so a
mis-tapped match point doesn't leave a phantom result behind. Abandoned matches are never recorded;
only completed ones. The last 50 are kept.

## Development

```bash
npm run dev      # dev server
npm test         # scoring-rule tests
npm run build    # typecheck + production build (generates the service worker)
npm run preview  # serve the production build
```

The scoring rules live in `src/lib/match.ts` and are pure functions with no UI dependencies —
that is where to look first, and `src/lib/match.test.ts` covers deuce, best-of-N and undo.
The match archive is `src/lib/history.ts`, also pure, tested in `src/lib/history.test.ts`.

Two independent localStorage keys: `tt-scoreboard-v1` for the match in progress and
`tt-scoreboard-history-v1` for the archive. Keeping them apart means corrupt data in one cannot
take the other down. Both are read defensively and fall back to empty rather than throwing.

## Adding it to a phone home screen

Run `npm run dev -- --host`, then open the printed network address on the phone and use
*Share → Add to Home Screen*. It launches fullscreen with no browser chrome.

Two things only behave correctly on a real device, not in desktop emulation: the swipe-down
gesture (which has to beat pull-to-refresh) and the safe-area insets around the notch. Test those
on the phone.

Screen wake lock and a genuine install prompt both need a secure context, so over plain-HTTP LAN
they stay inactive — serve the build over HTTPS or a tunnel if you want to verify them.
