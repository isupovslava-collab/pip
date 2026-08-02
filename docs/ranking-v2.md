# Ranking v2 — Single Slide precision

Алгоритм детерминирован и сохраняет базовые веса: сценарий 30, аудитория 20, цель 20, стиль 15, тип слайда 15.

## Pipeline

1. **Base relevance.** Сумма совпавших пользовательских параметров.
2. **Content-type guardrails.** `exact`, `compatible`, `fallback`, `incompatible` определяются единой матрицей.
3. **Quality tie-breaker.** Production Hero получает `+3` только для exact/compatible, совпадающего Hero scenario и base score не ниже 60. Meeting и Strategy не approved и не участвуют.
4. **Diversity reranking.** Внутри допустимого content tier применяется ограниченный penalty за повтор композиции, направления, source family и tags.
5. **Top 6.** При шести сильных exact выбираются только exact. При четырёх-пяти недостающие места занимают compatible. При меньшем пуле допускается ограниченный fallback; incompatible не заполняет выдачу до шести.

Сильный exact имеет base score не ниже 35 и совпадает хотя бы по сценарию или цели. Это не позволяет слабому exact из чужой задачи вытеснить содержательно подходящий compatible. Случайность отсутствует; tie-break — score, русское название, Reference ID.

Cover guardrail имеет приоритет над secondary content tags. Исключение `speech + inspire + story` ограничено одним cover ниже exact story.
