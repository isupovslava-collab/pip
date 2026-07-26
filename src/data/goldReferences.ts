import type { ScenarioId } from '../types/reference'

export interface GoldReferenceMapping {
  queryId: string
  referenceId: string
  scenarioId: ScenarioId
  title: string
  reason: string
}

export const goldReferences: GoldReferenceMapping[] = [
  {"queryId":"sales-client-approval","referenceId":"REF-000013","scenarioId":"sales","title":"Коммерческое предложение: выбор формата сотрудничества","reason":"Реалистичная сравнительная таблица ведёт клиента к обоснованному выбору формата."},
  {"queryId":"sales-ceo-decision","referenceId":"REF-000014","scenarioId":"sales","title":"Экономика решения: эффект для клиента","reason":"Управленческий business case связывает инвестицию с измеримым клиентским эффектом."},
  {"queryId":"sales-client-story","referenceId":"REF-000015","scenarioId":"sales","title":"История ценности: от потерь к результату","reason":"Аргументационная история показывает проблему, решение и доказанный результат."},
  {"queryId":"speech-employees-inspiration","referenceId":"REF-000016","scenarioId":"speech","title":"Перемены начинаются с каждого","reason":"Эмоциональный storyline делает роль каждого сотрудника частью общего изменения."},
  {"queryId":"speech-board-alignment","referenceId":"REF-000017","scenarioId":"speech","title":"Один ориентир. Одна команда.","reason":"Полноценный титульный слайд создаёт фокус без имитации графика или dashboard."},
  {"queryId":"speech-client-inspiration","referenceId":"REF-000018","scenarioId":"speech","title":"Доверие клиента строится на опыте","reason":"Сюжет из реальных точек опыта поддерживает вдохновляющее выступление."},
  {"queryId":"project-board-approval","referenceId":"REF-000019","scenarioId":"project","title":"Выбор проекта: эффект, риски, реализуемость","reason":"Матрица решения даёт правлению прозрачное основание для одобрения проекта."},
  {"queryId":"project-technical-problem","referenceId":"REF-000020","scenarioId":"project","title":"Корневая причина: узкое место интеграции","reason":"Содержательная техническая схема объясняет проблему без wireframe-условностей."},
  {"queryId":"project-manager-roadmap","referenceId":"REF-000021","scenarioId":"project","title":"Дорожная карта запуска за 16 недель","reason":"Рабочая дорожная карта показывает правлению реалистичный путь реализации."},
  {"queryId":"meeting-team-alignment","referenceId":"REF-000022","scenarioId":"meeting","title":"Процесс решения: от сигнала к владельцу","reason":"Совещание получает не абстрактные стрелки, а готовый механизм принятия решения."},
  {"queryId":"meeting-manager-decision","referenceId":"REF-000023","scenarioId":"meeting","title":"Пульс программы: решения этой недели","reason":"Dashboard отделяет факты от вопросов, требующих решения руководителей."},
  {"queryId":"meeting-technical-alignment","referenceId":"REF-000024","scenarioId":"meeting","title":"Матрица согласования технических требований","reason":"Рабочая матрица помогает экспертам согласовать позиции по конкретным пунктам."},
  {"queryId":"report-manager-kpi","referenceId":"REF-000025","scenarioId":"report","title":"Итоги квартала: рост при сохранении маржи","reason":"KPI-слайд содержит правдоподобные метрики, динамику и объяснение результата."},
  {"queryId":"report-cfo-dashboard","referenceId":"REF-000026","scenarioId":"report","title":"Финансовая панель: план, факт, прогноз","reason":"Финансовый dashboard выглядит как готовый экран управленческой отчётности."},
  {"queryId":"report-technical-table","referenceId":"REF-000027","scenarioId":"report","title":"Причины отклонения SLA и план восстановления","reason":"Таблица и диаграмма раскрывают причины отклонения и конкретный план действий."},
  {"queryId":"training-employees-process","referenceId":"REF-000028","scenarioId":"training","title":"Новый стандарт работы: пять шагов","reason":"Обучающий процесс показывает содержание шагов и проверяемый результат."},
  {"queryId":"training-team-timeline","referenceId":"REF-000029","scenarioId":"training","title":"Маршрут освоения навыка за 30 дней","reason":"Реалистичный учебный маршрут помогает участнику видеть темп и контрольные точки."},
  {"queryId":"training-technical-story","referenceId":"REF-000030","scenarioId":"training","title":"Как система принимает решение","reason":"Техническая логика объяснена через пример и понятное дерево решений."},
  {"queryId":"strategy-ceo-roadmap","referenceId":"REF-000031","scenarioId":"strategy","title":"Стратегическая дорожная карта 2027","reason":"Roadmap показывает последовательность выбора и реалистичные горизонты исполнения."},
  {"queryId":"strategy-board-alignment","referenceId":"REF-000032","scenarioId":"strategy","title":"Карта приоритетов: где создаём преимущество","reason":"Стратегическая карта соединяет амбицию, выбор и измеримые результаты."},
  {"queryId":"strategy-manager-comparison","referenceId":"REF-000033","scenarioId":"strategy","title":"Три сценария роста: выбор на основе фактов","reason":"Сценарное сравнение помогает руководителям выбрать направление роста."},
  {"queryId":"budget-cfo-approval","referenceId":"REF-000034","scenarioId":"budget_defense","title":"Бюджет программы: статьи, эффект, контроль","reason":"Полноценная бюджетная таблица поддерживает решение финансового руководителя."},
  {"queryId":"budget-board-decision","referenceId":"REF-000035","scenarioId":"budget_defense","title":"Риски бюджета: что влияет на решение","reason":"Настоящая risk map показывает severity, владельцев и остаточный риск."},
  {"queryId":"budget-ceo-kpi","referenceId":"REF-000036","scenarioId":"budget_defense","title":"Инвестиционный тезис: 18% ROI за 24 месяца","reason":"Executive KPI-слайд связывает инвестицию, денежный эффект и запрос на одобрение."},
]
