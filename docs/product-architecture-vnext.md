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
```

`selectCuratedCore` is a strict whitelist gate followed by deterministic ordering and composition-family diversity. Zero is a valid result. Proposed reclassifications, pending candidates, archived references, and weak fillers cannot enter production. The results architecture, Fresh Discovery v3 prompt, copy-confirm-open provider handoff, and persistent wizard context remain unchanged.

## Decision boundary

The authoritative PO map is versioned source data. The internal review route stores local decisions and exports an audit artifact but never mutates production. Reclassification only creates a future candidate; it is not approval.

Cover Recovery Round 2 is a separate eight-item review dataset and route: six revised PIP-original candidates, one preserved baseline, and one reclassified existing reference. Lineage and applied PO feedback are explicit. Every candidate has zero production exposure until a future PO decision is deliberately applied and validated.

## Preserved systems

The 100-reference dataset, legacy diagnostic ranking, Inspiration Board, old saved reference detail access, feedback history and migration, Test Mode, dashboard, analytics, exports, verified-source layer, Product Approval, and Reference Intelligence remain compatible. Excluded saved references remain accessible but are never labelled as an approved PIP standard.

## Roadmap boundary

“Подобрать структуру всей презентации,” Bring Your Reference, uploads, AI analysis, PPTX generation, backend/API work, Fresh Discovery v4, and mass library expansion remain outside Sprint 9.3.
