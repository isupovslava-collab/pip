# Ranking v2

Алгоритм остаётся детерминированным и сохраняет базовые веса Sprint 1: сценарий 30, аудитория 20, цель 20, стиль 15, тип контента 15.

## Этапы

1. **Base score.** Сумма совпавших параметров без изменения пользовательских весов.
2. **Content guardrails.** Кандидаты делятся на exact/compatible, semantic fallback и hard fallback. Более строгий content tier всегда рассматривается раньше следующего.
3. **Quality tie-breaker.** Production Hero получает `+3` только при совпадении сценария, exact/compatible content type, base score не ниже 60 и отсутствии hard mismatch. Бонус меньше веса любого пользовательского параметра. `productionApproved=false` никогда не участвует.
4. **Diversity reranking.** Greedy-выбор сохраняет relevance главным фактором и применяет ограниченный penalty за третью карточку одного `compositionFamily`/`visualDirection`, повтор source family и общие tags.
5. **Fallback.** Сначала compatible, затем сильный semantic, затем hard-incompatible кандидат. Причина fallback всегда выводится пользователю.

При равенстве используются `rankScore`, русская сортировка `title`, затем стабильный `referenceId`. Случайность отсутствует. Top 6 при достаточном пуле содержит минимум три композиционных семейства и не более двух карточек одного семейства или визуального направления.
