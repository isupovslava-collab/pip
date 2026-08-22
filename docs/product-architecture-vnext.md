# PIP Product Architecture vNext

## Product path

```text
Single-slide task understanding
  ↓
Premium Curated Core
  - exact content type
  - Premium visual quality
  - PO type verified
  - PO disposition approved
  - rights/source gate passed
  - 0–3 results
  +
Fresh Discovery v3
  ↓
Presentation Intelligence
  - Visual Principle
  - Why It Works
  - Slide Anatomy and Hierarchy
  - Content Mapping
  - Preserve / Replace / Avoid
  - Design Brief
```

`selectCuratedCore` is a strict whitelist gate followed by deterministic ordering and composition-family diversity. Zero is a valid result. Proposed reclassifications, pending candidates, archived references, and weak fillers cannot enter production. The results architecture, Fresh Discovery v3 prompt, copy-confirm-open provider handoff, and persistent wizard context remain unchanged.

## Decision boundary

Authoritative PO decisions are versioned source data. Round 1 remains untouched as history; the Cover Round 2 Final log overlays three approvals and one revision. The internal review route stores local notes and exports an audit artifact but never mutates production. Reclassification or revision alone never creates production exposure.

Cover Recovery Round 2 remains a separate eight-item audit dataset and route. Three approved candidate assets are deliberately materialized under stable library IDs `REF-000016`, `REF-000017`, and `REF-000047`; the physical library remains 100 records. `COVER-R2-03B` stays revision-only with no production mapping.

## Preserved systems

The 100-reference dataset, legacy diagnostic ranking, Inspiration Board, old saved reference detail access, feedback history and migration, Test Mode, dashboard, analytics, exports, verified-source layer, Product Approval, and Reference Intelligence remain compatible. Excluded saved references remain accessible but are never labelled as an approved PIP standard.

Presentation Intelligence V1 is a static, reference-specific explanation layer for exactly the 20 production-approved Curated Core references. It consumes optional wizard context only when composing an adaptation brief. It does not feed ranking or eligibility. The internal PO review stores local decisions separately from authoritative production data.

## Roadmap boundary

“Подобрать структуру всей презентации,” Bring Your Reference, Visual Principle Transfer, Slide Creation Assistance, uploads, AI analysis, PPTX generation, backend/API work, Fresh Discovery v4, and mass library expansion remain future layers and are not implemented in Presentation Intelligence V1.
