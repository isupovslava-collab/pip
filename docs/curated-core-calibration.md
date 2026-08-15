# Premium Curated Core Calibration — Sprint 9.1

## Calibration result

Visual quality and content-type exactness are independent Product Owner gates. Six Premium references were audited against the human-first rubric. Five are exact, verified, and production eligible. One remains visually approved but is removed from production pending taxonomy correction.

| Reference | Visual | Current type | Type decision | Proposed type | Composition family | Production |
| --- | --- | --- | --- | --- | --- | --- |
| REF-000013 | APPROVE | Comparison | VERIFIED | — | premium-option-comparison confirmed | YES |
| REF-000016 | APPROVE | Story | VERIFIED | — | keynote-metaphor confirmed | YES |
| REF-000019 | APPROVE | Comparison | RECLASSIFY | Story | business-case confirmed | NO |
| REF-000025 | APPROVE | KPI | VERIFIED | — | executive-performance confirmed | YES |
| REF-000028 | APPROVE | Process | VERIFIED | — | illustrated-learning-journey confirmed | YES |
| REF-000034 | APPROVE | Table | VERIFIED | — | financial-waterfall confirmed | YES |

The auditable source of these decisions is `src/data/curated-core-po-verification-map.json`. No title-based or metadata-derived verification is allowed.

## Known Comparison correction

`REF-000019`, “Business case проекта Phoenix”, is a strong visual business-case argument with project stages, not a comparison of alternatives. It is preserved as `review_only`, marked `reclassify`, proposed as `story`, and cannot appear for a production Comparison query. `REF-000013` remains the exact Comparison reference because it visibly presents three alternatives, common decision criteria, and a recommendation.

## Coverage after calibration

The aspiration is two Premium, exact, PO-verified references per type, with different composition families. This is not a quota: 0 strong is better than 1 weak, and 1 strong is better than 2 mediocre.

| Type | Approved exact | Gap to aspiration 2 | Priority |
| --- | ---: | ---: | --- |
| KPI | 1 | 1 | 2 |
| Comparison | 1 | 1 | 2 |
| Timeline | 0 | 2 | 1 |
| Process | 1 | 1 | 3 |
| Dashboard | 0 | 2 | 1 |
| Cover | 0 | 2 | 1 |
| Story | 1 | 1 | 3 |
| Table | 1 | 1 | 3 |

## Candidates awaiting Product Owner review

- `REF-000022` — Process candidate, `review_only`, visual quality `unknown`, type status `pending`.
- `REF-000031` — Timeline candidate, `review_only`, visual quality `unknown`, type status `pending`.
- The remaining non-calibrated library records stay `pending`; dataset membership does not imply candidacy or approval.

No new candidate was promoted in Sprint 9.1. Dashboard and Cover therefore remain at zero rather than receiving weak fillers.

## Review workflow

The internal route `#/test-curated-core-review` exposes type and quick filters, current/proposed type, all source/product metadata, local PO notes, actions, same-type comparison for up to three candidates, and JSON export. Local decisions do not mutate source data or production ranking. Exported decisions must be deliberately applied to the explicit map and revalidated.

## Evidence

- `npm run report:curated-core` measures verification and exact coverage.
- `npm run report:curated-core-calibration` measures statuses, gaps, known misclassifications, and composition duplicates.
- `npm run report:production-result-quality` proves wrong-type, non-premium, and type-unverified exposure.
