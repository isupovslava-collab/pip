import type { ContentTypeId, DesignDna, GoalId, PersonaId, ScenarioId, StyleId } from '../types/reference'

export type Option<T extends string> = { id: T; label: string; description: string }

export const scenarios: Option<ScenarioId>[] = [
  { id: 'sales', label: 'Продажа', description: 'Продать продукт, услугу или решение клиенту' },
  { id: 'speech', label: 'Выступление', description: 'Удержать внимание и донести идею' },
  { id: 'project', label: 'Защита проекта', description: 'Представить проект и убедить поддержать идею' },
  { id: 'meeting', label: 'Совещание', description: 'Сфокусировать обсуждение и договориться' },
  { id: 'report', label: 'Отчёт', description: 'Показать результаты и выводы' },
  { id: 'training', label: 'Обучение', description: 'Передать знания и закрепить материал' },
  { id: 'strategy', label: 'Стратегия', description: 'Обозначить направление и приоритеты' },
  { id: 'budget_defense', label: 'Защита бюджета', description: 'Обосновать расходы и получить решение' },
]

export const personas: Option<PersonaId>[] = [
  { id: 'ceo', label: 'Руководитель компании', description: 'Кратко, по существу и с выводом' },
  { id: 'cfo', label: 'Финансовый руководитель', description: 'Цифры, допущения и риски' },
  { id: 'board', label: 'Правление', description: 'Стратегический уровень решения' },
  { id: 'manager', label: 'Руководители подразделений', description: 'Ответственность, показатели и действия' },
  { id: 'employees', label: 'Работники', description: 'Понятное объяснение и вовлечение' },
  { id: 'technical_experts', label: 'Технические специалисты', description: 'Логика, детали и доказательства' },
  { id: 'team', label: 'Проектная команда', description: 'Общий контекст и следующие шаги' },
  { id: 'client', label: 'Заказчик', description: 'Ценность, варианты и ожидаемый результат' },
]

export const goals: Option<GoalId>[] = [
  { id: 'approve', label: 'Получить одобрение', description: 'Подвести к уверенному решению' },
  { id: 'decide', label: 'Помочь принять решение', description: 'Показать выбор и последствия' },
  { id: 'align', label: 'Согласовать позиции', description: 'Создать единое понимание' },
  { id: 'explain_results', label: 'Объяснить результаты', description: 'Связать факты, причины и выводы' },
  { id: 'teach', label: 'Научить', description: 'Выстроить понятный путь обучения' },
  { id: 'explain_problem', label: 'Объяснить проблему', description: 'Раскрыть причины и влияние' },
  { id: 'compare_options', label: 'Сравнить варианты', description: 'Сделать различия наглядными' },
  { id: 'inspire', label: 'Вовлечь и вдохновить', description: 'Создать эмоциональный импульс' },
]

export const styles: Option<StyleId>[] = [
  { id: 'executive', label: 'Строгий управленческий', description: 'Сдержанно, ясно, ориентировано на решение' },
  { id: 'corporate', label: 'Корпоративный', description: 'Универсально и системно' },
  { id: 'consulting', label: 'Консалтинговый', description: 'Тезисно и аналитично' },
  { id: 'modern', label: 'Современный', description: 'Свежо, динамично и выразительно' },
  { id: 'industrial', label: 'Производственный', description: 'Практично, точно и предметно' },
  { id: 'minimal', label: 'Минималистичный', description: 'Только главное и больше воздуха' },
]

export const contentTypes: Option<ContentTypeId>[] = [
  { id: 'kpi', label: 'KPI и ключевые цифры', description: 'Метрики, динамика и отклонения' },
  { id: 'comparison', label: 'Сравнение вариантов', description: 'Критерии, различия и выбор' },
  { id: 'timeline', label: 'Сроки и этапы', description: 'Хронология и контрольные точки' },
  { id: 'process', label: 'Процесс или алгоритм', description: 'Последовательность действий' },
  { id: 'dashboard', label: 'Сводная панель', description: 'Несколько показателей на одном экране' },
  { id: 'cover', label: 'Титульный и имиджевый слайд', description: 'Сильное начало и ключевой образ' },
  { id: 'story', label: 'История и аргументация', description: 'Логика повествования и смысл' },
  { id: 'table', label: 'Табличные данные', description: 'Структурированные подробности' },
]

export const labels = {
  scenario: Object.fromEntries(scenarios.map(({ id, label }) => [id, label])) as Record<ScenarioId, string>,
  persona: Object.fromEntries(personas.map(({ id, label }) => [id, label])) as Record<PersonaId, string>,
  goal: Object.fromEntries(goals.map(({ id, label }) => [id, label])) as Record<GoalId, string>,
  style: Object.fromEntries(styles.map(({ id, label }) => [id, label])) as Record<StyleId, string>,
  contentType: Object.fromEntries(contentTypes.map(({ id, label }) => [id, label])) as Record<ContentTypeId, string>,
}

export const designDnaLabels: Record<keyof DesignDna, string> = {
  minimalism: 'Минимализм', corporate: 'Корпоративность', executive: 'Управленческий характер',
  modern: 'Современность', whitespace: 'Воздух', dataDensity: 'Плотность данных',
  formality: 'Формальность', visualComplexity: 'Визуальная сложность',
}
