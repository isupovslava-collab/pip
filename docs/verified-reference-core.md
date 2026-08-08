# Verified Reference Core и Intelligence Pilot

## Режим продукта

PIP по-прежнему работает в Single Slide Mode: пользователь выбирает дизайн одного конкретного типа слайда. Sprint 8 не меняет ranking, веса, совместимость типов или состав production-библиотеки из 100 PIP references.

Verified Source Layer — отдельный слой provenance. Он не означает копирование внешнего слайда. PIP хранит metadata, проверенные ссылки, права и изученный композиционный принцип; production preview остаётся оригинальной PIP-интерпретацией с собственными текстом, данными и графикой.

## Архитектура данных

- `PipReference` в `public/data/references.json` отвечает за production-подбор, preview и ranking metadata.
- `SourceReference` в `src/data/sourceReferences` отвечает за внешний документ, конкретную страницу, статус проверки, права и provenance.
- `SourceVerificationReview` хранит семь независимых gates: source, document, page, visual, content type, scenario и rights.
- `ReferenceIntelligence` связывается только с явно указанными production references и описывает Slide Anatomy и Data Mapping.
- Связь `sourceReferenceIds` означает подтверждённый источник композиционного принципа, а не простое визуальное сходство.

Статусы источника:

- `candidate` — исследовательский lead, который ещё не проверен;
- `source_found` — документ найден, но хотя бы один обязательный gate не завершён;
- `verified` — все семь gates имеют `pass`;
- `rejected` — источник рассмотрен и отклонён с сохранённой причиной.

Автоматического promotion по рабочей ссылке нет. Поле `visualReview: awaiting_po_review` честно отделяет инженерную верификацию от визуального решения Product Owner.

## Права и отображение

`rightsStatus` описывает только подтверждённый режим использования. Для `explicit-permission` и `official-embed` обязателен `rightsEvidenceUrl`. При `link-only-no-local-copy` внешний thumbnail и внешний slide не сохраняются и не показываются внутри PIP; интерфейс открывает конкретную страницу первоисточника в новой вкладке.

Badge «Проверенный источник» разрешён только для `verificationStatus: verified`. `source_found` показывается как продолжающаяся проверка.

## Текущее покрытие

В Sprint 8 подтверждено 8 из целевых 24 источников: по одному для `kpi`, `comparison`, `timeline`, `process`, `dashboard`, `cover`, `story` и `table`. Недостающие 16 записей не созданы фиктивно и отражены как gap 2/3 по каждому типу. Текущее ядро охватывает 5 организаций, 6 документов и 8 визуальных направлений.

Воспроизводимые отчёты:

- `reports/verified-reference-coverage.md`;
- `reports/verified-reference-coverage.json`;
- `reports/rejected-reference-report.json`.

## Intelligence Pilot

Slide Anatomy и Data Mapping добавлены ровно для шести production Hero: Sales, Speech, Project, Report, Training и Budget Defense. Meeting и Strategy остаются review-only и не подключены. При отсутствии Intelligence обычная detail page продолжает работать.

Feedback schema v3 сохраняет события открытия Intelligence, просмотра Data Mapping, открытия verified source, оценку полезности, комментарий и описание отсутствующего референса. Миграция выполняется при чтении старых sessions без очистки Inspiration Board или других ключей `localStorage`.

## Проверка изменений

```bash
npm run validate:verified-references
npm run report:verified-coverage
npm run validate:reference-intelligence
```

Internal review доступен по `#/test-reference-review`; он содержит фильтры, coverage и семь gates для каждой записи.
