# PIP — Presentation Intelligence Platform

PIP помогает подобрать несколько вариантов дизайна для одного конкретного типа слайда с учетом задачи, аудитории, ожидаемого результата и визуального направления.

**Статус:** MVP v0.8 — Single Slide Mode + Verified Reference Core Pilot

**Сайт:** https://isupovslava-collab.github.io/pip/

**Hero Review Gallery:** https://isupovslava-collab.github.io/pip/hero-reference-review.html

Sprint 7.1 однозначно фиксирует текущий режим как подбор одного слайда. Пятый шаг выбирает конкретный тип, exact matches доминируют в Top 6, близкие форматы ограничены и помечены. Библиотека остаётся равной 100 records; шесть approved Hero неизменны, Meeting v2 и Strategy v2 остаются review-only.

Sprint 8 добавляет независимый Verified Source Layer и Presentation Intelligence Pilot, не меняя ranking. Проверено 8 из целевых 24 внешних источников — по одному на каждый тип слайда; оставшийся gap опубликован честно. Slide Anatomy и Data Mapping доступны для шести production Hero. Internal review: `#/test-reference-review`.

## Что проверяет MVP

Sprint проверяет, может ли пользователь без обучения за 2–3 минуты выбрать параметры задачи и получить несколько понятных, отсортированных и объясненных рекомендаций по дизайну презентации.

## Возможности MVP

- пошаговый мастер из пяти вопросов;
- Single Slide Mode с единой матрицей совместимости восьми типов слайдов;
- детерминированное ранжирование 100 референсов, включая 24 source-backed Gold References;
- оригинальные high-fidelity preview, созданные PIP после изучения открытых первоисточников;
- карточка первоисточника с организацией, правовым статусом и внешней ссылкой;
- объяснение причин каждой рекомендации;
- подробная карточка с профилем дизайна;
- Inspiration Board с сохранением ID в `localStorage`;
- анонимный Test Mode с обратной связью по подборке и отдельным референсам;
- выбор одного Best Reference независимо от Inspiration Board;
- локальный журнал событий и служебный dashboard с экспортом JSON/CSV;
- адаптивный русскоязычный интерфейс;
- публикация на GitHub Pages.
- отдельный реестр candidate / source_found / verified / rejected источников с семью gate-проверками;
- Slide Anatomy и Data Mapping для шести production Hero;
- prompt «Какого референса вам не хватило?» после выбора «Нет подходящего результата»;

## Технологии

React, TypeScript, Vite, Tailwind CSS, React Router с `HashRouter`, Vitest, React Testing Library и ESLint. Приложение полностью статическое: без backend, базы данных и внешних API.

## Локальный запуск

Требуется Node.js 22 или новее.

```bash
npm install
npm run dev
```

## Проверки и сборка

```bash
npm run validate:data
npm run report:coverage
npm run check:duplicates
npm run generate:hero-references
npm run validate:hero-references
npm run report:diversity
npm run validate:content-precision
npm run validate:verified-references
npm run report:verified-coverage
npm run validate:reference-intelligence
npm run lint
npm run test
npm run build
```

Production-сборка создается в папке `dist`.

Исходники восьми Hero-композиций находятся в `tools/hero-references`, финальные PNG — в `public/hero-references`, исследование источников — в `docs/hero-reference-sources.md`, реестр прав — в `docs/reference-rights-ledger.md`, а визуальный self-review — в `docs/hero-reference-visual-review.md`.

## Структура данных

Библиотека из 100 референсов находится в `public/data/references.json`, а схема — в `reference.schema.json`. Каждый референс содержит уникальный ID, локальное preview, параметры соответствия, рекомендации по применению и восемь показателей профиля дизайна. Для 24 Gold References дополнительно хранятся Source Record, права, дата проверки ссылки и режим `original_pip_interpretation`. PIP не хранит чужие слайды: пользователь видит самостоятельную визуальную интерпретацию и может открыть публичный материал отдельно.

Текущие квоты опубликованы в `docs/library-coverage.md`, правила сопровождения — в `docs/reference-library-guidelines.md`, карта источников и адаптаций — в `docs/source-backed-gold-map.md`, а контактный лист визуального контроля — в `public/gold-contact-sheet.html`.

Архитектура Verified Source Layer, схема статусов, права, текущие gaps и Intelligence Pilot описаны в `docs/verified-reference-core.md`. Воспроизводимые отчёты находятся в `reports/verified-reference-coverage.md`, `reports/verified-reference-coverage.json` и `reports/rejected-reference-report.json`.

Пилот запускается по адресу `#/search?test=1`. Локальный dashboard доступен только по прямому адресу `#/test-feedback`, а реестр источников — `#/test-reference-review`; оба экрана намеренно не добавлены в основную навигацию. Инструкция модератора находится в `docs/user-testing-guide.md`, правила текущего режима — в `docs/single-slide-mode.md`, будущий режим структуры — только в `docs/presentation-structure-mode-roadmap.md`, а замечание к homepage hero — в `docs/product-design-backlog.md`.

Чтобы добавить новый референс:

1. Добавьте объект в `public/data/references.json` по структуре JSON Schema.
2. Используйте следующий ID формата `REF-000000` без дублирования.
3. Добавьте локальное оригинальное SVG, PNG или WebP-превью в `public/previews` и укажите относительный путь.
4. Используйте только ID из словарей `src/data/dictionaries.ts`.
5. При использовании генератора выполните `npm run generate:previews`; результат должен быть детерминированным.
6. Обновите ограничение количества объектов в схеме и тесте целостности данных, если меняется целевой размер библиотеки.
7. Запустите `validate:data`, `report:coverage`, `check:duplicates`, lint, тесты и production build.

## Ограничения версии

MVP не создаёт презентации, не анализирует загруженные файлы, не использует backend или регистрацию. Тестовые данные и события сохраняются только в `localStorage` текущего браузера, не синхронизируются между устройствами и не содержат намеренно собираемых персональных данных. Для объединения результатов пилота Product Owner должен скачать JSON/CSV после сессий. 24 Gold References опираются на открытые публичные источники, однако локальные preview содержат только оригинальные тексты, данные и графику PIP. Остальные 76 референсов остаются демонстрационными.

## Публикация

Workflow `.github/workflows/deploy-pages.yml` проверяет и публикует `dist` при каждом push в `main`. Для первого запуска в настройках репозитория необходимо выбрать `Settings → Pages → Source: GitHub Actions`.
