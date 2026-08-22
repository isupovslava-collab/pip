# Карта production-интеграции Hero References

Шесть одобренных Hero заменяют визуал и metadata существующих records. ID сохранены, поэтому старые ссылки и Inspiration Board продолжают работать. Все production preview — оригинальные PNG PIP 1600×900.

| Scenario | Сохранённый ID | Preview | Metadata и источник | Контрольный запрос | Ожидание |
|---|---|---|---|---|---|
| Sales | `REF-000013` | `previews/REF-000013.png` | client / approve / consulting+modern / comparison; HubSpot Investor Presentation | sales/client/approve/consulting/comparison | Top 3 |
| Speech | `REF-000016` | `previews/REF-000016.png` | employees+board / inspire+align / modern+executive / cover+story; TED slide guidance | primary Cover after Cover Round 2 Final | Top 3 |
| Project | `REF-000019` | `previews/REF-000019.png` | board / approve / executive / comparison+kpi; HM Treasury business-case guidance | project/board/approve/executive/comparison | Top 3 |
| Report | `REF-000025` | `previews/REF-000025.png` | manager / explain_results / corporate / kpi+dashboard; World Bank Annual Report | report/manager/explain_results/corporate/kpi | Top 3 |
| Training | `REF-000028` | `previews/REF-000028.png` | employees / teach / modern / process+timeline; OpenLearn pathway | training/employees/teach/modern/process | Top 3 |
| Budget Defense | `REF-000034` | `previews/REF-000034.png` | cfo / approve / executive / table+dashboard; HM Treasury Budget documents | budget_defense/cfo/approve/executive/table | Top 3 |

Для всех шести: `qualityTier=hero`, `sourceBacked=true`, `previewMode=original_pip_interpretation`, `productionApproved=true`, `referenceSchemaVersion=2`. Внешние источники открываются отдельно; чужие слайды не хранятся локально.

## Revised, not integrated

| Scenario | Review asset | Status |
|---|---|---|
| Meeting | `hero-references/HERO-MEETING-001.png` + `tools/hero-references/meeting` | `productionApproved=false`; REVISED — AWAITING PRODUCT OWNER REVIEW |
| Strategy | `hero-references/HERO-STRATEGY-001.png` + `tools/hero-references/strategy` | `productionApproved=false`; REVISED — AWAITING PRODUCT OWNER REVIEW |

Они доступны только в `hero-reference-review.html` и отсутствуют в production ranking до отдельного APPROVE.
