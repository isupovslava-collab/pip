# PIP Curated Core Strategy

## Purpose

Curated Core is a compact library of strong, understandable, reusable composition patterns. It is not an attempt to collect every slide. PIP combines this predictable known-good layer with Fresh Discovery for current external examples. The primary question is whether a user task has a genuinely strong and exact visual pattern; the number of references is secondary.

## Independent approval gates

Visual quality approval and content-type Product Owner verification are separate, explicit gates. Production eligibility requires all of the following:

1. `curatedCoreStatus === eligible`;
2. `visualReferenceQuality === premium`;
3. `contentTypePoVerificationStatus === verified`;
4. `screenSuitable === true` and `productionApproved === true`;
5. an approved PIP-original Hero interpretation or a source-backed asset passing the existing source gate;
6. `primaryContentTypeId` exactly matching the selected content type.

No status is inferred from title, quality tier, dataset membership, visual approval, or an existing `eligible` flag. Missing PO type status migrates to `pending`. Previously approved records are preserved only through the auditable map in `src/data/curated-core-po-verification-map.json`.

## Reclassification

When a reference is visually strong but assigned to the wrong type, it remains available for review with `contentTypePoVerificationStatus: reclassify` and an explicit `proposedPrimaryContentType`. It is removed from production immediately. The proposed type never affects production; metadata must be corrected and explicitly verified by the Product Owner before eligibility can be restored.

## Source and visual rules

A source-backed reference requires verified source identity, material/page evidence, rights documentation, Product Owner approval, Premium visual quality, and PO-verified exact type. A PIP-original interpretation must be polished, screen suitable, original in text/data/execution, non-infringing, and separately approved for visual quality and type exactness. Synthetic schematics, wireframes, generic chart templates, and prototype placeholders are excluded by default.

## Coverage model

The aspiration is two Premium exact references with distinct composition families per content type. It is explicitly non-binding: zero strong references is preferable to one weak filler. Dashboard, Timeline, and Cover are the highest-priority gaps; KPI and Comparison follow; Process, Story, and Table are monitored for diversity. New candidates default to `review_only`, `pending`, and `good` or `unknown` visual quality until explicit review.

Coverage is evaluated through exact PO-verified counts, composition-family diversity, visual-direction diversity, wrong-type exposure, type-unverified exposure, prototype exposure, fallback/no-suitable rate, and repeat-reference rate.

## Review and measurement

`#/test-curated-core-review` is the internal calibration surface. Actions and notes are local and exportable; they do not mutate source or production data. `npm run report:curated-core` reports eligibility, PO verification, composition families, and gaps. `npm run report:curated-core-calibration` reports the full status distribution, known reclassifications, coverage gaps, and duplicate-family warnings. `npm run report:production-result-quality` executes control queries and reports 0/1/2/3 distribution plus wrong-type, non-premium, and type-unverified exposure.

Fresh Discovery supplies breadth and freshness but never turns external AI output into a verified or approved PIP result. Future promotion requires explicit Product Owner review and evidence from user sessions; coverage never improves by filling empty slots.
