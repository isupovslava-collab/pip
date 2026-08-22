# Cover Recovery Pack

## Final state

The eight-item Round 2 pack remains an immutable candidate and lineage audit. The authoritative final decision log is `src/data/curatedCore/cover-round-2-final.json`.

| Rank | Candidate | Decision | Priority | Production mapping |
| ---: | --- | --- | --- | --- |
| 1 | REF-000016 · Будущее не случается. Мы переходим в него. | APPROVE | Primary / Hero cover | REF-000016 |
| 2 | COVER-CAND-004 · Следующий рубеж ближе, чем кажется. | APPROVE | Secondary cover | REF-000017 |
| 3 | COVER-R2-02A · Стратегия без лишнего. | APPROVE | Secondary / Minimal cover | REF-000047 |
| 4 | COVER-R2-03B · 2027 | REVISE | Not production-ready | none |

The approved assets are materialized under stable `REF-*` IDs, so the physical library remains exactly 100 records. Every production Cover is Premium, PO type verified, PO approved, screen suitable, and assigned a distinct composition family.

The dark large-year candidate retains `productionExposure: false`. Its overlap issue is explicit: the text block must move below the digits, and a future revision requires a separate PO approval.

## Review and audit

`#/test-cover-recovery-review` shows final APPROVE / REVISE statuses, rank, priority, exact production mapping, PO rationale, preview, lineage, local notes, and comparison for up to three candidates. Export schema v3 includes the immutable final decision log and local review notes; `productionApplied` is true only for the three approved mappings.

The remaining four Round 2 variants are retained as `NOT SELECTED` audit records and have no production exposure.
