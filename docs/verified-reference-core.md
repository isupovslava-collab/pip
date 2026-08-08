# Verified Reference Core, Product Approval Gate и Intelligence Pilot

## Режим продукта

PIP работает в Single Slide Mode и подбирает дизайн одного конкретного типа слайда. Sprint 8.1 не меняет ranking, веса, матрицу совместимости или состав production-библиотеки из 100 PIP references.

Verified Reference Core — независимый слой provenance. PIP хранит метаданные, проверенные ссылки, сведения о правах и изученный композиционный принцип; production preview остаётся оригинальной PIP-интерпретацией со своими текстом, данными и графикой.

## Два независимых gate

`SourceVerificationReview` отвечает только за инженерную проверку источника: source, document, page, visual, content type, scenario и rights.

Статусы Source Verification:

- `candidate` — исследовательский lead;
- `source_found` — документ найден, но обязательные gates ещё не завершены;
- `source_verified` — все семь gates имеют `pass`;
- `source_rejected` — источник проверен и отклонён с сохранённой причиной.

`PipProductReview` хранит отдельное продуктовое решение Product Owner:

- `awaiting_po_review`;
- `pip_approved`;
- `pip_rejected`.

Обязательные критерии: `semanticFit`, `visualInspiration`, `screenSuitability`, `designFreshness`, дата и заметки Product Owner, а для отклонения — структурированная причина.

Production eligibility определяется строго как:

```text
sourceVerificationStatus = source_verified
AND
pipProductReviewStatus = pip_approved
```

Рабочая ссылка, успешная source verification или наличие внешнего документа сами по себе не дают production-badge.

## Решения Product Owner Sprint 8.1

| Source | Source Verification | PIP Product Review | Production |
| --- | --- | --- | --- |
| SRC-0001 · HubSpot pricing comparison | source_verified | pip_approved | yes |
| SRC-0002 · HubSpot unit economics | source_verified | pip_rejected | no |
| SRC-0003 · TCFD next steps | source_verified | pip_rejected | no |
| SRC-0004 · HM Treasury options framework | source_verified | pip_rejected | no |
| SRC-0005 · World Bank financial summary | source_verified | pip_rejected | no |
| SRC-0006 · NASA strategic plan cover | source_verified | pip_approved | yes |
| SRC-0007 · World Bank infrastructure spread | source_verified | pip_rejected | no |
| SRC-0008 · HM Treasury household table | source_verified | pip_rejected | no |

Итого: 8 source verified, 2 PIP approved, 6 PIP rejected и 8 записей awaiting PO review.

## Перепроверка прав SRC-0004

Предыдущая классификация `explicit-permission` была неточной. На странице copyright официального PDF HM Treasury указано, что публикация лицензирована по Open Government Licence v3.0, кроме отдельно оговорённых материалов третьих лиц.

Итоговая классификация:

- `rightsStatus: other-open-licence`;
- `licenseName: Open Government Licence v3.0`;
- `rightsEvidenceUrl: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/`;
- `displayMode: source-link-only`.

Локальная копия внешнего слайда не хранится. Аналогичная корректировка применена к SRC-0008 из того же лицензионного режима.

## Покрытие

Source-verified coverage остаётся 1/3 по каждому из восьми типов. PIP-approved coverage:

- `comparison`: 1/3;
- `cover`: 1/3;
- `kpi`, `timeline`, `process`, `dashboard`, `story`, `table`: 0/3.

Отчёты source verification и product approval намеренно разделены:

- `reports/verified-reference-coverage.md` и `.json`;
- `reports/approved-reference-coverage.md` и `.json`;
- `reports/rejected-reference-report.json`.

## Fresh Discovery Prompt Pilot

После Top 6 пользователь видит компактный блок для поиска свежих внешних референсов. Генератор формирует персонализированный русскоязычный prompt из сценария, аудитории, цели, стиля и типа слайда, добавляет рекомендации конкретного content type и требует официальный источник, конкретную страницу и честное указание непроверенных данных.

PIP не вызывает внешний AI API, не отправляет пользовательские данные и не сохраняет найденные visuals. Пользователь копирует prompt и запускает его самостоятельно. Результаты явно не считаются проверенными PIP references.

Feedback schema v4 сохраняет `fresh_discovery_prompt_shown`, `fresh_discovery_prompt_copied`, оценку полезности в Test Mode и полный обезличенный контекст запроса. Миграция старых sessions выполняется без очистки Inspiration Board и других ключей `localStorage`.

### Prompt v2 · Sprint 8.1.1

По итогам первого A/B-теста baseline заменён на Prompt v2. Версия использует те же пять ответов пользователя и отдельные guidance для восьми content types, но усиливает quality gate:

- до 8 результатов без обязательного заполнения quota;
- только визуально проверенные конкретные слайды или страницы;
- обязательные Design Freshness и Screen Suitability;
- исключение document-like report spreads, мелкого текста, обычных таблиц, стандартных графиков, wireframes и визуально устаревших решений;
- сначала Exact References, затем только полезные Creative Alternatives;
- сортировка от самого сильного визуального решения;
- запрет выдуманных URL, страниц, названий и содержания;
- запрос preview, когда внешний интерфейс его поддерживает.

Новые sessions и Fresh Discovery events содержат `freshDiscoveryPromptVersion: v2`. Старые записи без поля остаются baseline и не перемаркируются при чтении. Версия включена в JSON/CSV export и агрегируется отдельно в локальном dashboard.

## Проверка

```bash
npm run validate:verified-references
npm run report:verified-coverage
npm run validate:reference-intelligence
npm run validate:product-approval
npm run report:approved-reference-coverage
npm run validate:fresh-discovery-prompt
```

Internal review доступен по `#/test-reference-review`; dashboard с метриками Fresh Discovery — по `#/test-feedback`.
