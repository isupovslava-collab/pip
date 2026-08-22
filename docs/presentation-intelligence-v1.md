# Presentation Intelligence V1

## Purpose

Presentation Intelligence turns an approved visual reference into an actionable explanation. It helps the user understand why the slide works, what structural principle to keep, which content to replace, and how to adapt the pattern without copying the original.

V1 is intentionally static and deterministic. It adds no API, server, LLM call, similarity score, or runtime ranking signal.

## Production scope

Intelligence is available for exactly the 20 production-approved Curated Core references:

| Content type | References |
| --- | --- |
| KPI | REF-000014, REF-000025, REF-000036 |
| Comparison | REF-000013, REF-000033 |
| Timeline | REF-000021, REF-000029 |
| Process | REF-000020, REF-000022, REF-000028 |
| Dashboard | REF-000023, REF-000026 |
| Cover | REF-000016, REF-000017, REF-000047 |
| Story | REF-000015, REF-000018 |
| Table | REF-000024, REF-000027, REF-000034 |

Archive, revise, rejected, pending, and non-approved records receive no V1 production exposure.

## Data contract

Each `ReferenceIntelligenceV1` record contains:

- a reference-specific visual principle;
- three to five reasons the composition works;
- slide anatomy with priority and role;
- hierarchy and reading-order guidance;
- source-to-user content mapping;
- explicit preserve, replace, and avoid rules;
- best-fit and less-suitable use cases;
- deterministic design-brief settings.

The dataset is split by content type in `src/data/referenceIntelligence/`. The validation script checks exact production coverage, schema completeness, content-type agreement, distinct principles, generic wording warnings, and composer coverage.

## User experience

The detail route `#/reference/:id` shows the full Intelligence panel for an eligible reference. Results cards use the action “Разобрать слайд”. The design brief uses the current wizard context when it is present and remains useful when a user opens a detail page directly.

Copying a brief gives an accessible confirmation. Analytics records panel views, section openings, and successful brief copies through the existing feedback event system.

## Product Owner review

`#/test-intelligence-review` exposes all 20 records one at a time, supports content-type, reference, and review-scope filters, and provides previous/next navigation. Statuses and notes are stored locally and can be exported as JSON. They are an audit aid only: they cannot change production approval, ranking, or eligibility.

## Manual preview spot checks

The authored analysis was checked against at least one real preview per type:

- KPI — REF-000025: recovery headline, three metrics, trend and management conclusion;
- Comparison — REF-000013: recommendation-led three-option commercial choice;
- Timeline — REF-000021: four workstreams, sixteen weeks, three gates and go-live;
- Process — REF-000022: signal-to-owner operating flow;
- Dashboard — REF-000023: readiness, budget, risk and team decision panel;
- Cover — REF-000016: bridge metaphor; REF-000047: typography-first minimal cover;
- Story — REF-000015: loss-to-value narrative transition;
- Table — REF-000024: requirements matrix with IDs, owners and statuses.

These checks validate semantic fit, not pixel-level reconstruction.

## Boundaries

V1 does not change the wizard, ranking, Curated Core gate, Fresh Discovery v3, provider handoff, or reference assets. It does not add Bring Your Reference, visual-principle transfer, slide generation, or automated layout reconstruction.

