# PIP Product Architecture vNext

## Product path

```text
Task Understanding
  ↓
Premium Curated Core
  - visually premium
  - PO content-type verified
  - exact only
  - 0–3
  +
Fresh Discovery
  ↓
Presentation Intelligence
```

The single-slide wizard produces one exact `contentTypeId`. `selectCuratedCore` applies independent visual and Product Owner content-type gates, existing source/product gates, exact primary-content matching, deterministic internal scoring, composition-family diversity, and a maximum of three cards. Zero is a valid honest result. No legacy compatible result, proposed reclassification, pending candidate, or weak filler enters this surface. Internal scores remain diagnostic and are not displayed.

Fresh Discovery v3 is the breadth and freshness layer. It remains the accepted copy → confirmed → open-provider handoff. External results never enter ranking or the local library automatically, and Sprint 9.1 does not alter provider behavior or prompt architecture.

## Calibration boundary

The internal review route stores Product Owner decisions locally and exports an auditable JSON artifact. Runtime review actions never mutate the physical library. Applying a decision requires a deliberate source-map change, data regeneration, validation, and another explicit verification step. `proposedPrimaryContentType` is review metadata only.

## Preserved systems

The physical 100-reference dataset, legacy ranking, Inspiration Board, feedback history, Test Mode, dashboard, JSON/CSV export, verified-source layer, Product Approval, Reference Intelligence, old analytics, and missing-reference feedback remain available. Missing verification fields normalize to `pending` without changing Board or analytics keys.

## Future mode

“Подобрать структуру всей презентации” remains roadmap-only. It must not reuse single-slide ranking without a separate product model and user evidence. Sprint 10 Intelligence, upload analysis, PPTX, backend/API work, and mass library growth are outside this architecture increment.
