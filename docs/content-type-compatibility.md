# Совместимость типов контента

Ranking v2 сначала ищет точный `contentTypeId`, затем разрешённые соседние форматы. Если их недостаточно для шести карточек, добавляется смысловой fallback, и только последним — явно несовместимый fallback с видимой причиной.

| Запрос | Совместимый fallback | Hard incompatibility |
|---|---|---|
| `kpi` | `dashboard`, `table` | `cover` |
| `comparison` | `table`, `story` | `cover` |
| `timeline` | `process`, `story` | `cover` |
| `process` | `timeline`, `story` | `cover` |
| `dashboard` | `kpi`, `table` | `cover` |
| `cover` | `story` | `dashboard` |
| `story` | `cover`, `comparison` | — |
| `table` | `dashboard`, `kpi`, `comparison` | `cover`, `timeline` |

Исключение: для `speech + inspire` cover допустим как keynote/story-format, но не поднимается выше точного совпадения. Hard-incompatible карточки не входят в Top 6, пока exact/compatible/semantic-кандидатов достаточно. Если без них невозможно сформировать шесть результатов, карточка маркируется как резервный fallback в «Почему подходит».

Матрица намеренно мала и основана на подтверждённых проблемах пилота: титульные слайды в запросах на сроки, процессы, таблицы и данные; timeline как ложная замена таблицы; dashboard как ложная замена титульного слайда.
