# Cover Recovery Pack

## Boundary

Cover has zero approved production references. Four PIP-original candidates are isolated in `src/data/coverRecoveryCandidates.ts` and reviewed at `#/test-cover-recovery-review`. They do not extend or mutate the 100-reference library and cannot enter production ranking.

| ID | Direction | Composition family |
| --- | --- | --- |
| COVER-CAND-001 | editorial premium atmosphere | editorial-visual-cover |
| COVER-CAND-002 | premium minimal typography | oversized-typographic-cover |
| COVER-CAND-003 | premium corporate year motif | oversized-numeric-cover |
| COVER-CAND-004 | cinematic opening statement | cinematic-statement-cover |

Every preview is 1600×900, self-contained, brand neutral, and built with project-native vector, gradient, texture, typography, and light treatments. There are no downloaded slides, external logos, embedded photographs, third-party fonts, or copied corporate graphics.

Initial state is always `review_only`, `good`, type `pending`, and PO disposition `pending`. The gallery stores five PO answers locally and exports JSON with `productionApplied: false`. APPROVE / REVISE / REJECT decisions are not auto-applied.

Quality checks cover explicit 16:9 dimensions, unique families and directions, readable text, missing assets, clipping/overflow, and zero production exposure. Final promotion requires a future explicit Product Owner decision and another validated commit.
