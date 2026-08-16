# Premium Curated Core Calibration — Sprint 9.2

## Applied Product Owner round

The central map `src/data/curatedCore/po-review-round-1.json` covers all 100 legacy references exactly once. It records 17 approved, 4 reclassify, 1 revise_visual, 76 rejected_schematic, 1 rejected_quality, and 1 pending decision.

| Type | Approved IDs | Count |
| --- | --- | ---: |
| KPI | REF-000014, REF-000025, REF-000036 | 3 |
| Comparison | REF-000013, REF-000033 | 2 |
| Timeline | REF-000021, REF-000029 | 2 |
| Process | REF-000020, REF-000022, REF-000028 | 3 |
| Dashboard | REF-000023, REF-000026 | 2 |
| Cover | — | 0 |
| Story | REF-000015, REF-000018 | 2 |
| Table | REF-000024, REF-000027, REF-000034 | 3 |

Production total is exactly 17. Every approved reference is Premium, PO type verified, eligible, and protected by the existing source/originality gate.

## Non-production queues

- `REF-000016`: Story → proposed Cover; reclassify, review_only.
- `REF-000019`: Comparison → proposed Story; reclassify, review_only.
- `REF-000030`: Story → proposed Process; reclassify, review_only.
- `REF-000032`: not Timeline; new type intentionally unset pending PO reclassification.
- `REF-000017`: exact Cover but visual needs revision; good, review_only.
- `REF-000031`: exact Timeline but below Premium quality; good, excluded.
- `REF-000035`: no authoritative Round 1 decision; pending, review_only.

No reclassification is auto-approved after a proposed metadata change.

## Coverage and quality

Seven content types meet the non-binding minimum of two. Cover is the only gap and remains at zero instead of receiving a filler. The separate Cover Recovery Pack contains four review-only PIP-original candidates; it is not part of the 100-reference production dataset.

The production quality report confirms zero wrong-type, non-approved, rejected-schematic, reclassify, and revise exposure across control queries.

## Evidence

- `npm run validate:po-review-decisions`
- `npm run report:po-review-round-1`
- `npm run report:curated-core`
- `npm run report:curated-core-calibration`
- `npm run report:production-result-quality`
