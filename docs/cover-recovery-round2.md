# Cover Recovery Round 2

## Outcome

Round 2 is a human-review shortlist, not a production release. It contains eight candidates across five visual families:

- six revised PIP-original covers derived from Candidates 1–3;
- the unchanged strong baseline `COVER-CAND-004`;
- `REF-000016` as a reclassified Story → Cover candidate.

All candidates have `productionExposure: false`. Cover production remains zero.

## Applied Product Owner feedback

Candidate 1 now has an image-led editorial horizon scene and a separate atmospheric light-field version. Both replace random right-side geometry with a purposeful visual anchor.

Candidate 2 now has a pure-typography cover and a typography-led cover with one integrated light column. Detached decorative geometry was removed.

Candidate 3 retains the large-year principle. Version 3A separates the title into a safe zone; Version 3B uses a deliberate contrast caption plane so the overlap reads as intentional editorial design.

Candidate 4 is preserved unchanged as the preferred Round 1 baseline. `REF-000016` joins the pack without automatic reclassification or approval.

## Cover quality rule

Decorative geometry must earn its place.

A Cover candidate cannot be approved if the dominant visual behaves like arbitrary filler rather than a meaningful visual or strong atmospheric treatment. A title slide must be driven by one clear principle: image-led story, decisive typography, atmospheric depth, large-year/number, or a strong opening statement.

The desired future production mix is at least three approved covers from at least three distinct families:

- image-led/editorial;
- typography-led;
- atmospheric/abstract or large-year.

This is aspirational and never justifies a weak filler.

## Review workflow

Open `#/test-cover-recovery-review`. The gallery shows large previews, family, origin, lineage, rationale, applied PO feedback, local notes, and APPROVE / REVISE / REJECT status. Compare Mode supports up to three candidates and explains the 3/3 limit. Export is local-only and includes `productionApplied: false`.

Evidence:

- `npm run validate:cover-candidate-quality`
- `npm run report:cover-recovery-round2`
- `reports/cover-recovery-round2.json`
- `reports/cover-recovery-round2.md`

