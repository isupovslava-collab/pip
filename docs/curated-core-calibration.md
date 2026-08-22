# Premium Curated Core Calibration

## Applied Product Owner rounds

`po-review-round-1.json` preserves the initial decisions for all 100 legacy records. `cover-round-2-final.json` records the later final Cover ranking, three approvals, the exact candidate-to-reference mappings, and one revision without production exposure.

| Type | Approved IDs | Count |
| --- | --- | ---: |
| KPI | REF-000014, REF-000025, REF-000036 | 3 |
| Comparison | REF-000013, REF-000033 | 2 |
| Timeline | REF-000021, REF-000029 | 2 |
| Process | REF-000020, REF-000022, REF-000028 | 3 |
| Dashboard | REF-000023, REF-000026 | 2 |
| Cover | REF-000016, REF-000017, REF-000047 | 3 |
| Story | REF-000015, REF-000018 | 2 |
| Table | REF-000024, REF-000027, REF-000034 | 3 |

Production total is 20. All eight content types meet their non-binding coverage target. Every production reference is Premium, PO type verified, eligible, and protected by the source or approved PIP-original gate.

## Effective non-production queues

- `REF-000019`: Comparison → proposed Story; reclassify, review_only.
- `REF-000030`: Story → proposed Process; reclassify, review_only.
- `REF-000032`: not Timeline; new type intentionally unset pending PO reclassification.
- `REF-000031`: exact Timeline but below Premium quality; good, excluded.
- `REF-000035`: no authoritative Round 1 decision; pending, review_only.
- `COVER-R2-03B`: dark large-year Cover; revise visual, no production mapping.

The production quality report confirms zero wrong-type, non-approved, rejected-schematic, reclassify, and revise exposure across control queries.

## Evidence

- `npm run validate:po-review-decisions`
- `npm run validate:cover-candidate-quality`
- `npm run report:po-review-round-1`
- `npm run report:curated-core`
- `npm run report:curated-core-calibration`
- `npm run report:production-result-quality`
