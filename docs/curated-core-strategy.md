# PIP Curated Core Strategy

## Purpose

Curated Core is a compact library of strong, understandable, reusable visual and composition patterns. It is not an attempt to collect every slide on the internet. PIP combines this predictable known-good core with Fresh Discovery for current external examples.

The primary coverage question is: **does a user task have a genuinely strong and useful visual pattern?** The number of references is a secondary metric.

## Quota-first is not the success model

PIP explicitly rejects “24 at any cost”, “1000 references”, and “X references per type at any cost” as definitions of success. Sprint work must not expand the library merely to fill a numerical quota. New candidates should close a demonstrated user or composition gap and pass the appropriate quality gates.

## Curated Core eligibility

Production selection uses explicit product fields, not an inference from legacy `qualityTier`: `primaryContentTypeId`, `screenSuitable`, `visualReferenceQuality`, and `curatedCoreStatus`. A result is eligible only when its status is `eligible`, quality is `premium`, screen suitability and production approval are true, and the asset is either an approved PIP-original Hero interpretation or a source-backed reference that passes the product gate. Selection is exact on `primaryContentTypeId`, deterministic, composition-aware, and capped at three. Zero, one, or two results are honest valid states.

### Source-backed references

A source-backed reference enters Curated Core only when both gates pass:

1. `SOURCE_VERIFIED` — the link, source identity, material type, page/slide evidence, and rights record have been verified.
2. `PIP_APPROVED` — the Product Owner has approved the candidate for production use.

Being publicly reachable or present in the 100-reference dataset is not enough.

### PIP-original Hero or interpretation

A PIP-original reference must be high-fidelity, suitable for screen viewing, visually inspiring, based on a clear composition principle, approved by the Product Owner, and recognizably complete rather than a wireframe. It must use original text, data, and visual execution and must not directly copy protected branding or artwork from a source.

### Prototype treatment

Synthetic, schematic, or prototype references are excluded from Curated Core by default. They may remain in the 100-reference dataset for testing and continuity, but dataset membership does not grant Curated Core status. A prototype must be redesigned and pass the relevant approval gates before it can enter the core.

## Coverage model

Curated Core coverage is evaluated through:

- `approved_exact_coverage_by_content_type`;
- `composition_family_coverage`;
- `visual_direction_diversity`;
- `prototype_exposure`;
- `fallback_rate`;
- `no_suitable_rate`;
- `repeat_reference_rate`.

For each content type, PIP should offer meaningfully different ways to solve the same communication task. For example, Timeline may include a classic horizontal timeline, phased roadmap, milestone matrix, hero-image timeline, and achieved-versus-expected structure. These are directions for observed coverage, not hard quotas.

## Measurement and decisions

`npm run report:curated-core` measures explicit eligibility and coverage. `npm run report:production-result-quality` executes production selection across control queries and reports the 0/1/2/3 distribution, wrong-type exposure, and non-premium exposure. The legacy `npm run report:result-quality-mix` remains a diagnostic comparison and does not describe production Curated Core.

The `qualityTier` field is maintained metadata, not automated visual truth. The report therefore describes exposure according to the current taxonomy and cannot guarantee that every visually schematic reference is labeled `prototype`. Visual review and Product Owner approval remain required.

Future library work should be driven by external user sessions, missing-reference feedback, fallback/no-suitable rates, and composition-family gaps. Fresh Discovery supplies breadth and freshness; it does not turn external AI results into verified or PIP-approved references.
