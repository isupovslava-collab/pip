# Реестр источников и прав Hero References

Дата ревизии: **2026-08-02**. Политика Sprint 6 консервативна: даже если источник опубликован по открытой лицензии или относится к материалам государственных органов, локальный Hero-preview является самостоятельной работой PIP, а источник представлен только ссылкой.

| Hero ID | Организация / источник | Правовой статус в PIP | Локальная копия источника | Основание |
| --- | --- | --- | --- | --- |
| `HERO-SALES-001` | HubSpot Investor Presentation | `link-only-no-local-copy` | Нет | Публичная ссылка используется только для изучения и атрибуции. |
| `HERO-SPEECH-001` | TED, Create + prepare slides | `link-only-no-local-copy` | Нет | Текст, кадры, знаки TED и записи выступлений не копировались. |
| `HERO-PROJECT-001` | HM Treasury, business-case guidance | `link-only-no-local-copy` | Нет | Доступна [Open Government Licence 3.0](https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/), но PIP использует только общую методическую логику. |
| `HERO-MEETING-001` | Atlassian, DACI | `link-only-no-local-copy` | Нет | Шаблоны и брендовые компоненты не переносились. |
| `HERO-REPORT-001` | World Bank Annual Report 2024 | `link-only-no-local-copy` | Нет | Отчёт изучался как публичный источник; данные и графики Hero синтетические. |
| `HERO-TRAINING-001` | Open University / OpenLearn | `link-only-no-local-copy` | Нет | Условия доступны на [странице OpenLearn](https://www.open.edu/openlearn/about-openlearn/terms-and-conditions); учебный текст и иллюстрации источника не копировались. |
| `HERO-STRATEGY-001` | NASA Strategic Plan | `link-only-no-local-copy` | Нет | [NASA Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) зафиксированы; изображения и знаки NASA не использовались. |
| `HERO-BUDGET-001` | HM Treasury, Budget 2025 | `link-only-no-local-copy` | Нет | Доступна OGL 3.0, но PIP хранит только собственный preview и внешнюю ссылку. |

## Локальные визуальные активы

| Файл | Происхождение | Права и ограничения |
| --- | --- | --- |
| `tools/hero-references/shared/assets/speech-bridge.png` | Создан для PIP встроенной генерацией изображений OpenAI по текстовому заданию | Оригинальный локальный актив; без логотипов, текста и заимствованных персонажей. |
| `tools/hero-references/shared/assets/training-practice.png` | Создан для PIP встроенной генерацией изображений OpenAI по текстовому заданию | Оригинальный локальный актив; без логотипов, текста и заимствованных персонажей. |

Финальные PNG в `public/hero-references` — рендер самостоятельных HTML/CSS-композиций PIP. В них нет встроенных сетевых ресурсов, поэтому review gallery воспроизводима и не зависит от доступности сторонних сайтов.
