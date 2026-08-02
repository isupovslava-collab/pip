# Совместимость типов слайдов

Единственный источник правил — `src/data/contentTypeCompatibility.ts`. Компоненты интерфейса не содержат собственной матрицы.

| Выбранный тип | Compatible | Hard incompatible |
|---|---|---|
| `kpi` | `dashboard`, `table` | `cover`, `process`, `timeline` |
| `comparison` | `table`, `story` | `cover`, `dashboard`, `timeline` |
| `timeline` | `process` | `cover`, `table`, `dashboard`, `kpi` |
| `process` | `timeline`, `story` | `cover`, `dashboard`, `kpi` |
| `dashboard` | `kpi`, `table` | `cover`, `story`, `timeline` |
| `cover` | `story` | `kpi`, `comparison`, `timeline`, `process`, `dashboard`, `table` |
| `story` | `cover`, `comparison`, `process` | — |
| `table` | `comparison`, `dashboard`, `kpi` | `cover`, `timeline`, `process` |

`cover` имеет дополнительный строгий guardrail: в non-cover запросах карточка с cover исключается, даже если её второй tag выглядит совместимым. Единственное исключение — `speech + inspire + story`; там допускается максимум один keynote-like cover, только ниже exact story.

Compatible карточка получает метку «Близкий формат» и объяснение нехватки exact-вариантов. General fallback получает метку «Дополнительная альтернатива». Incompatible не используется ради заполнения шести мест.
