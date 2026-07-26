export const taxonomy = {
  scenarios: ['sales', 'speech', 'project', 'meeting', 'report', 'training', 'strategy', 'budget_defense'],
  personas: ['ceo', 'cfo', 'board', 'manager', 'employees', 'technical_experts', 'team', 'client'],
  goals: ['approve', 'decide', 'align', 'explain_results', 'teach', 'explain_problem', 'compare_options', 'inspire'],
  styles: ['executive', 'corporate', 'consulting', 'modern', 'industrial', 'minimal'],
  contentTypes: ['kpi', 'comparison', 'timeline', 'process', 'dashboard', 'cover', 'story', 'table'],
}

export const coverageMinimums = {
  scenarios: { sales: 20, speech: 15, project: 20, meeting: 18, report: 20, training: 16, strategy: 18, budget_defense: 15 },
  personas: { ceo: 15, cfo: 12, board: 15, manager: 25, employees: 15, technical_experts: 12, team: 18, client: 20 },
  goals: { approve: 20, decide: 25, align: 18, explain_results: 18, teach: 12, explain_problem: 15, compare_options: 20, inspire: 15 },
  styles: { executive: 25, corporate: 35, consulting: 22, modern: 28, industrial: 15, minimal: 20 },
  contentTypes: { kpi: 18, comparison: 20, timeline: 18, process: 18, dashboard: 15, cover: 15, story: 20, table: 18 },
}

export const labels = {
  scenarios: {
    sales: 'Продажа', speech: 'Выступление', project: 'Защита проекта', meeting: 'Совещание',
    report: 'Отчёт', training: 'Обучение', strategy: 'Стратегия', budget_defense: 'Защита бюджета',
  },
  personas: {
    ceo: 'руководителя компании', cfo: 'финансового руководителя', board: 'правления', manager: 'руководителей подразделений',
    employees: 'работников', technical_experts: 'технических специалистов', team: 'проектной команды', client: 'заказчика',
  },
  goals: {
    approve: 'получить одобрение', decide: 'помочь принять решение', align: 'согласовать позиции',
    explain_results: 'объяснить результаты', teach: 'научить', explain_problem: 'объяснить проблему',
    compare_options: 'сравнить варианты', inspire: 'вовлечь и вдохновить',
  },
  styles: {
    executive: 'строгий управленческий', corporate: 'корпоративный', consulting: 'консалтинговый',
    modern: 'современный', industrial: 'производственный', minimal: 'минималистичный',
  },
  contentTypes: {
    kpi: 'KPI и ключевые цифры', comparison: 'сравнение вариантов', timeline: 'сроки и этапы',
    process: 'процесс или алгоритм', dashboard: 'сводная панель', cover: 'титульный слайд',
    story: 'история и аргументация', table: 'табличные данные',
  },
}

export const controlQueries = [
  { id: 'sales-client-approval', scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison', minimumScore: 100 },
  { id: 'sales-ceo-decision', scenarioId: 'sales', personaId: 'ceo', goalId: 'decide', styleId: 'executive', contentTypeId: 'kpi', minimumScore: 100 },
  { id: 'sales-client-story', scenarioId: 'sales', personaId: 'client', goalId: 'compare_options', styleId: 'modern', contentTypeId: 'story', minimumScore: 100 },

  { id: 'speech-employees-inspiration', scenarioId: 'speech', personaId: 'employees', goalId: 'inspire', styleId: 'modern', contentTypeId: 'story', minimumScore: 100 },
  { id: 'speech-board-alignment', scenarioId: 'speech', personaId: 'board', goalId: 'align', styleId: 'minimal', contentTypeId: 'cover', minimumScore: 100 },
  { id: 'speech-client-inspiration', scenarioId: 'speech', personaId: 'client', goalId: 'inspire', styleId: 'corporate', contentTypeId: 'story', minimumScore: 100 },

  { id: 'project-board-approval', scenarioId: 'project', personaId: 'board', goalId: 'approve', styleId: 'executive', contentTypeId: 'comparison', minimumScore: 100 },
  { id: 'project-technical-problem', scenarioId: 'project', personaId: 'technical_experts', goalId: 'explain_problem', styleId: 'industrial', contentTypeId: 'process', minimumScore: 100 },
  { id: 'project-manager-roadmap', scenarioId: 'project', personaId: 'manager', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline', minimumScore: 100 },

  { id: 'meeting-team-alignment', scenarioId: 'meeting', personaId: 'team', goalId: 'align', styleId: 'modern', contentTypeId: 'process', minimumScore: 100 },
  { id: 'meeting-manager-decision', scenarioId: 'meeting', personaId: 'manager', goalId: 'decide', styleId: 'corporate', contentTypeId: 'dashboard', minimumScore: 100 },
  { id: 'meeting-technical-alignment', scenarioId: 'meeting', personaId: 'technical_experts', goalId: 'align', styleId: 'industrial', contentTypeId: 'table', minimumScore: 100 },

  { id: 'report-manager-kpi', scenarioId: 'report', personaId: 'manager', goalId: 'explain_results', styleId: 'corporate', contentTypeId: 'kpi', minimumScore: 100 },
  { id: 'report-cfo-dashboard', scenarioId: 'report', personaId: 'cfo', goalId: 'explain_results', styleId: 'executive', contentTypeId: 'dashboard', minimumScore: 100 },
  { id: 'report-technical-table', scenarioId: 'report', personaId: 'technical_experts', goalId: 'explain_problem', styleId: 'industrial', contentTypeId: 'table', minimumScore: 100 },

  { id: 'training-employees-process', scenarioId: 'training', personaId: 'employees', goalId: 'teach', styleId: 'modern', contentTypeId: 'process', minimumScore: 100 },
  { id: 'training-team-timeline', scenarioId: 'training', personaId: 'team', goalId: 'teach', styleId: 'corporate', contentTypeId: 'timeline', minimumScore: 100 },
  { id: 'training-technical-story', scenarioId: 'training', personaId: 'technical_experts', goalId: 'explain_problem', styleId: 'minimal', contentTypeId: 'story', minimumScore: 100 },

  { id: 'strategy-ceo-roadmap', scenarioId: 'strategy', personaId: 'ceo', goalId: 'decide', styleId: 'consulting', contentTypeId: 'timeline', minimumScore: 100 },
  { id: 'strategy-board-alignment', scenarioId: 'strategy', personaId: 'board', goalId: 'align', styleId: 'executive', contentTypeId: 'timeline', minimumScore: 100 },
  { id: 'strategy-manager-comparison', scenarioId: 'strategy', personaId: 'manager', goalId: 'compare_options', styleId: 'corporate', contentTypeId: 'comparison', minimumScore: 100 },

  { id: 'budget-cfo-approval', scenarioId: 'budget_defense', personaId: 'cfo', goalId: 'approve', styleId: 'executive', contentTypeId: 'table', minimumScore: 100 },
  { id: 'budget-board-decision', scenarioId: 'budget_defense', personaId: 'board', goalId: 'decide', styleId: 'corporate', contentTypeId: 'comparison', minimumScore: 100 },
  { id: 'budget-ceo-kpi', scenarioId: 'budget_defense', personaId: 'ceo', goalId: 'approve', styleId: 'consulting', contentTypeId: 'kpi', minimumScore: 100 },
]

export const goldContent = [
  { themeKey: 'comparison', title: 'Коммерческое предложение: выбор формата сотрудничества', focus: 'три формата сотрудничества сопоставлены по результату, сроку, вовлечению и стоимости', reason: 'Реалистичная сравнительная таблица ведёт клиента к обоснованному выбору формата.' },
  { themeKey: 'executive', title: 'Экономика решения: эффект для клиента', focus: 'экономический эффект раскрыт через рост выручки, снижение затрат и срок окупаемости', reason: 'Управленческий business case связывает инвестицию с измеримым клиентским эффектом.' },
  { themeKey: 'sales', title: 'История ценности: от потерь к результату', focus: 'путь от текущих потерь через подход к измеримому результату', reason: 'Аргументационная история показывает проблему, решение и доказанный результат.' },

  { themeKey: 'change', title: 'Перемены начинаются с каждого', focus: 'личный вклад сотрудников связан с общей целью и тремя этапами движения', reason: 'Эмоциональный storyline делает роль каждого сотрудника частью общего изменения.' },
  { themeKey: 'title', title: 'Один ориентир. Одна команда.', focus: 'сильный образ будущего и короткий манифест для общего выравнивания', reason: 'Полноценный титульный слайд создаёт фокус без имитации графика или dashboard.' },
  { themeKey: 'change', title: 'Доверие клиента строится на опыте', focus: 'три клиентских момента объединены в историю доверия и повторного выбора', reason: 'Сюжет из реальных точек опыта поддерживает вдохновляющее выступление.' },

  { themeKey: 'comparison', title: 'Выбор проекта: эффект, риски, реализуемость', focus: 'три проектных варианта оценены по взвешенным критериям', reason: 'Матрица решения даёт правлению прозрачное основание для одобрения проекта.' },
  { themeKey: 'technical', title: 'Корневая причина: узкое место интеграции', focus: 'техническая цепочка показывает симптом, причину, влияние и корректирующие меры', reason: 'Содержательная техническая схема объясняет проблему без wireframe-условностей.' },
  { themeKey: 'implementation', title: 'Дорожная карта запуска за 16 недель', focus: 'четыре потока работ, контрольные точки и критерии готовности', reason: 'Рабочая дорожная карта показывает правлению реалистичный путь реализации.' },

  { themeKey: 'process', title: 'Процесс решения: от сигнала к владельцу', focus: 'рабочий процесс связывает сигнал, разбор, решение, владельца и срок', reason: 'Совещание получает не абстрактные стрелки, а готовый механизм принятия решения.' },
  { themeKey: 'dashboard', title: 'Пульс программы: решения этой недели', focus: 'статус потоков, тренды, блокеры и решения собраны на одном рабочем экране', reason: 'Dashboard отделяет факты от вопросов, требующих решения руководителей.' },
  { themeKey: 'matrix', title: 'Матрица согласования технических требований', focus: 'требования, владельцы, статус и разногласия сведены в управляемую таблицу', reason: 'Рабочая матрица помогает экспертам согласовать позиции по конкретным пунктам.' },

  { themeKey: 'period', title: 'Итоги квартала: рост при сохранении маржи', focus: 'выручка, маржа, удержание и динамика квартала связаны с управленческим выводом', reason: 'KPI-слайд содержит правдоподобные метрики, динамику и объяснение результата.' },
  { themeKey: 'dashboard', title: 'Финансовая панель: план, факт, прогноз', focus: 'план-факт, прогноз года, денежный поток и отклонения представлены вместе', reason: 'Финансовый dashboard выглядит как готовый экран управленческой отчётности.' },
  { themeKey: 'technical', title: 'Причины отклонения SLA и план восстановления', focus: 'Pareto причин соединён с влиянием, владельцами и сроками восстановления', reason: 'Таблица и диаграмма раскрывают причины отклонения и конкретный план действий.' },

  { themeKey: 'process', title: 'Новый стандарт работы: пять шагов', focus: 'каждый шаг содержит действие, инструмент и критерий правильного выполнения', reason: 'Обучающий процесс показывает содержание шагов и проверяемый результат.' },
  { themeKey: 'learning', title: 'Маршрут освоения навыка за 30 дней', focus: 'четыре недели обучения объединяют практику, обратную связь и проверку навыка', reason: 'Реалистичный учебный маршрут помогает участнику видеть темп и контрольные точки.' },
  { themeKey: 'technical', title: 'Как система принимает решение', focus: 'входные данные проходят проверку, правила, исключения и контроль результата', reason: 'Техническая логика объяснена через пример и понятное дерево решений.' },

  { themeKey: 'timeline', title: 'Стратегическая дорожная карта 2027', focus: 'три горизонта связывают стратегические ставки, инициативы и результаты', reason: 'Roadmap показывает последовательность выбора и реалистичные горизонты исполнения.' },
  { themeKey: 'strategy', title: 'Карта приоритетов: где создаём преимущество', focus: 'North Star раскрыта через четыре приоритета и набор ключевых инициатив', reason: 'Стратегическая карта соединяет амбицию, выбор и измеримые результаты.' },
  { themeKey: 'comparison', title: 'Три сценария роста: выбор на основе фактов', focus: 'базовый, ускоренный и партнёрский сценарии сравниваются по эффекту и риску', reason: 'Сценарное сравнение помогает руководителям выбрать направление роста.' },

  { themeKey: 'matrix', title: 'Бюджет программы: статьи, эффект, контроль', focus: 'бюджет по статьям показывает сумму, изменение, эффект и владельца контроля', reason: 'Полноценная бюджетная таблица поддерживает решение финансового руководителя.' },
  { themeKey: 'risk', title: 'Риски бюджета: что влияет на решение', focus: 'риски нанесены на матрицу вероятность–влияние и связаны с мерами снижения', reason: 'Настоящая risk map показывает severity, владельцев и остаточный риск.' },
  { themeKey: 'kpi', title: 'Инвестиционный тезис: 18% ROI за 24 месяца', focus: 'ROI, NPV, окупаемость и мост эффекта формируют цельный инвестиционный тезис', reason: 'Executive KPI-слайд связывает инвестицию, денежный эффект и запрос на одобрение.' },
]

export const themes = [
  { key: 'title', title: 'Титульная идея', category: 'Титульные и имиджевые слайды', template: 'title', scenarios: ['speech', 'sales'], styles: ['minimal', 'modern'], contentTypes: ['cover', 'story'], summary: 'Сильный первый экран задаёт тему, масштаб и эмоциональный тон разговора.' },
  { key: 'kpi', title: 'Ключевой показатель', category: 'KPI и ключевые цифры', template: 'hero-number', scenarios: ['report', 'budget_defense'], styles: ['executive', 'corporate'], contentTypes: ['kpi', 'dashboard'], summary: 'Главная цифра подкреплена динамикой, контекстом и коротким управленческим выводом.' },
  { key: 'dashboard', title: 'Панель управления', category: 'Управленческие dashboards', template: 'dashboard', scenarios: ['report', 'meeting'], styles: ['corporate', 'executive'], contentTypes: ['dashboard', 'kpi'], summary: 'Несколько связанных метрик собраны в обзор состояния с ясными сигналами внимания.' },
  { key: 'comparison', title: 'Выбор решения', category: 'Сравнение вариантов', template: 'comparison', scenarios: ['sales', 'project'], styles: ['consulting', 'corporate'], contentTypes: ['comparison', 'table'], summary: 'Варианты сопоставлены по единым критериям, а рекомендация отделена от исходных данных.' },
  { key: 'matrix', title: 'Матрица приоритетов', category: 'Таблицы и матрицы', template: 'matrix', scenarios: ['project', 'budget_defense'], styles: ['corporate', 'consulting'], contentTypes: ['table', 'comparison'], summary: 'Структурированная матрица помогает увидеть приоритет, компромисс и основание выбора.' },
  { key: 'timeline', title: 'Маршрут развития', category: 'Timeline и дорожные карты', template: 'roadmap', scenarios: ['strategy', 'project'], styles: ['consulting', 'modern'], contentTypes: ['timeline', 'story'], summary: 'Этапы движения связаны с контрольными точками, результатами и переходом к следующей фазе.' },
  { key: 'process', title: 'Логика процесса', category: 'Процессы и алгоритмы', template: 'process', scenarios: ['meeting', 'training'], styles: ['modern', 'corporate'], contentTypes: ['process', 'timeline'], summary: 'Последовательность действий показывает входы, решения, ответственных и ожидаемый результат.' },
  { key: 'problem', title: 'Причины и действия', category: 'Причины проблемы и план действий', template: 'action-plan', scenarios: ['report', 'meeting'], styles: ['industrial', 'corporate'], contentTypes: ['process', 'story'], summary: 'Симптомы, корневые причины и меры собраны в единую причинно-следственную конструкцию.' },
  { key: 'change', title: 'История перемен', category: 'История изменений', template: 'storytelling', scenarios: ['speech', 'training'], styles: ['modern', 'minimal'], contentTypes: ['story', 'cover'], summary: 'Повествование связывает исходную ситуацию, поворотный момент и образ нового состояния.' },
  { key: 'sales', title: 'Аргумент продажи', category: 'Аргументация продажи', template: 'funnel', scenarios: ['sales', 'project'], styles: ['consulting', 'modern'], contentTypes: ['story', 'comparison'], summary: 'Аргументы ведут от потребности клиента к доказательству ценности и конкретному предложению.' },
  { key: 'value', title: 'Ценность решения', category: 'Ценностное предложение', template: 'recommendation', scenarios: ['sales', 'strategy'], styles: ['modern', 'minimal'], contentTypes: ['cover', 'story'], summary: 'Обещание ценности раскрыто через результат для аудитории, отличие и подтверждение эффекта.' },
  { key: 'risk', title: 'Карта рисков', category: 'Риски и ограничения', template: 'risk-map', scenarios: ['budget_defense', 'project'], styles: ['executive', 'industrial'], contentTypes: ['table', 'comparison'], summary: 'Вероятность, влияние и ответные меры делают ограничения прозрачными до принятия решения.' },
  { key: 'implementation', title: 'План реализации', category: 'План реализации', template: 'action-plan', scenarios: ['project', 'meeting'], styles: ['corporate', 'executive'], contentTypes: ['timeline', 'process'], summary: 'Пакеты работ, владельцы и контрольные точки превращают решение в исполнимый план.' },
  { key: 'period', title: 'Итоги периода', category: 'Итоги периода', template: 'dashboard', scenarios: ['report', 'strategy'], styles: ['corporate', 'executive'], contentTypes: ['kpi', 'dashboard'], summary: 'Факт, план, динамика и выводы периода формируют компактную основу для обсуждения.' },
  { key: 'learning', title: 'Обучающий маршрут', category: 'Обучающий маршрут', template: 'timeline', scenarios: ['training', 'speech'], styles: ['modern', 'minimal'], contentTypes: ['process', 'timeline'], summary: 'Материал разбит на понятные шаги с практикой, проверкой понимания и итоговым навыком.' },
  { key: 'strategy', title: 'Стратегическая карта', category: 'Стратегическая карта', template: 'roadmap', scenarios: ['strategy', 'project'], styles: ['consulting', 'executive'], contentTypes: ['timeline', 'dashboard'], summary: 'Амбиция, приоритеты и инициативы соединены в карту движения к целевому состоянию.' },
  { key: 'executive', title: 'Решение руководства', category: 'Решение для руководства', template: 'recommendation', scenarios: ['budget_defense', 'strategy'], styles: ['executive', 'corporate'], contentTypes: ['kpi', 'comparison'], summary: 'Короткая записка на одном экране формулирует решение, эффект, риски и требуемый шаг.' },
  { key: 'technical', title: 'Техническая логика', category: 'Техническое объяснение', template: 'process', scenarios: ['report', 'training'], styles: ['industrial', 'corporate'], contentTypes: ['process', 'table'], summary: 'Сложное устройство объясняется через уровни, связи и проверяемые технические параметры.' },
  { key: 'before-after', title: 'Переход к новому состоянию', category: 'До/после', template: 'before-after', scenarios: ['speech', 'sales'], styles: ['modern', 'minimal'], contentTypes: ['comparison', 'story'], summary: 'Контраст текущего и целевого состояния показывает изменение в опыте, метриках и поведении.' },
  { key: 'recommendation', title: 'Рекомендация к действию', category: 'Рекомендация и следующий шаг', template: 'recommendation', scenarios: ['meeting', 'strategy'], styles: ['consulting', 'executive'], contentTypes: ['story', 'table'], summary: 'Вывод, основание и следующий шаг собраны в завершение, которое помогает перейти к действию.' },
]
