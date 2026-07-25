import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { controlQueries, labels, taxonomy, themes } from './library-config.mjs'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const rootDirectory = path.resolve(scriptDirectory, '..')
const dataPath = path.join(rootDirectory, 'public', 'data', 'references.json')
const previewDirectory = path.join(rootDirectory, 'public', 'previews')
const controlsPath = path.join(rootDirectory, 'src', 'data', 'controlQueries.ts')
const previewsOnly = process.argv.includes('--previews-only')

const contexts = [
  'рост выручки', 'запуск продукта', 'качество сервиса', 'производственная безопасность',
  'цифровая трансформация', 'развитие команды', 'клиентский опыт', 'эффективность продаж',
  'портфель проектов', 'финансовая устойчивость', 'операционные риски', 'логистика',
  'энергоэффективность', 'автоматизация процессов', 'удержание клиентов', 'выход на рынок',
  'управление изменениями', 'инновационная программа', 'модернизация инфраструктуры', 'программа качества',
  'план закупок', 'инвестиционный портфель', 'продуктовая стратегия', 'развитие партнёрств',
  'оптимизация затрат', 'надёжность оборудования', 'скорость поставки', 'управление знаниями',
  'культура безопасности', 'сервисная модель', 'программа обучения', 'стандартизация процессов',
  'устойчивый рост', 'экспортное направление', 'корпоративная культура', 'трансформация функций',
  'аналитическая платформа', 'проектный офис', 'технический долг', 'развитие бренда',
  'сезонная кампания', 'обновление линейки', 'контроль исполнения', 'производительность команды',
  'качество данных', 'коммерческое предложение', 'ресурсный план', 'сценарное планирование',
  'программа лояльности', 'управление мощностями', 'внедрение системы', 'изменение регламента',
  'запуск филиала', 'улучшение продукта', 'план коммуникаций', 'клиентский портал',
  'единый стандарт', 'инвестиционное решение', 'сервисная поддержка', 'программа адаптации',
  'цепочка поставок', 'модель управления', 'рост конверсии', 'план восстановления',
]

const anchorSubjects = [
  'обоснованный выбор клиента', 'решение через экономический эффект', 'история ценности предложения',
  'энергия общего движения', 'единый образ будущего', 'доверие через понятный сюжет',
  'выбор проекта для правления', 'разбор технической причины', 'маршрут управленческого решения',
  'согласование рабочего процесса', 'решение по сигналам команды', 'единая техническая позиция',
  'итоги подразделения в цифрах', 'финансовая панель периода', 'таблица причин отклонения',
  'практический алгоритм для работников', 'карта освоения навыка', 'объяснение сложного через историю',
  'дорожная карта выбора', 'приоритеты для правления', 'сравнение стратегических направлений',
  'защита расходов по статьям', 'баланс эффекта и ограничений', 'инвестиционный тезис в цифрах',
]

const scenarioPersonas = {
  sales: ['client', 'ceo'], speech: ['employees', 'client'], project: ['board', 'technical_experts'],
  meeting: ['team', 'manager'], report: ['manager', 'cfo'], training: ['employees', 'team'],
  strategy: ['ceo', 'board'], budget_defense: ['cfo', 'board'],
}

const scenarioGoals = {
  sales: ['approve', 'compare_options'], speech: ['inspire', 'align'], project: ['approve', 'decide'],
  meeting: ['align', 'decide'], report: ['explain_results', 'explain_problem'], training: ['teach', 'inspire'],
  strategy: ['decide', 'align'], budget_defense: ['approve', 'compare_options'],
}

const compatibility = {
  personas: {
    ceo: ['sales', 'project', 'strategy', 'budget_defense', 'report'], cfo: ['budget_defense', 'report', 'strategy'],
    board: ['project', 'strategy', 'budget_defense', 'report'], manager: ['meeting', 'report', 'project', 'training', 'strategy'],
    employees: ['speech', 'training', 'meeting'], technical_experts: ['project', 'report', 'training', 'meeting'],
    team: ['meeting', 'training', 'project', 'strategy'], client: ['sales', 'speech', 'project'],
  },
  goals: {
    approve: ['sales', 'project', 'budget_defense'], decide: ['sales', 'project', 'meeting', 'report', 'strategy', 'budget_defense'],
    align: ['speech', 'project', 'meeting', 'training', 'strategy'], explain_results: ['report', 'meeting', 'strategy'],
    teach: ['training'], explain_problem: ['project', 'meeting', 'report', 'training'],
    compare_options: ['sales', 'project', 'report', 'strategy', 'budget_defense'], inspire: ['sales', 'speech', 'training'],
  },
  styles: {
    executive: taxonomy.scenarios, corporate: taxonomy.scenarios, consulting: ['sales', 'project', 'report', 'strategy', 'budget_defense'],
    modern: ['sales', 'speech', 'meeting', 'training', 'strategy'], industrial: ['project', 'meeting', 'report', 'training', 'budget_defense'],
    minimal: ['sales', 'speech', 'report', 'training', 'strategy'],
  },
  contentTypes: {
    kpi: ['sales', 'report', 'strategy', 'budget_defense'], comparison: ['sales', 'project', 'meeting', 'report', 'strategy', 'budget_defense'],
    timeline: ['project', 'meeting', 'report', 'training', 'strategy', 'budget_defense'], process: ['project', 'meeting', 'report', 'training'],
    dashboard: ['meeting', 'report', 'strategy', 'budget_defense'], cover: ['sales', 'speech', 'report', 'training', 'strategy'],
    story: ['sales', 'speech', 'project', 'meeting', 'training', 'strategy'], table: ['project', 'meeting', 'report', 'strategy', 'budget_defense'],
  },
}

const minimums = {
  scenarios: { sales: 20, speech: 15, project: 20, meeting: 18, report: 20, training: 16, strategy: 18, budget_defense: 15 },
  personas: { ceo: 15, cfo: 12, board: 15, manager: 25, employees: 15, technical_experts: 12, team: 18, client: 20 },
  goals: { approve: 20, decide: 25, align: 18, explain_results: 18, teach: 12, explain_problem: 15, compare_options: 20, inspire: 15 },
  styles: { executive: 25, corporate: 35, consulting: 22, modern: 28, industrial: 15, minimal: 20 },
  contentTypes: { kpi: 18, comparison: 20, timeline: 18, process: 18, dashboard: 15, cover: 15, story: 20, table: 18 },
}

const fieldNames = {
  scenarios: 'scenarioIds', personas: 'personaIds', goals: 'goalIds', styles: 'styleIds', contentTypes: 'contentTypeIds',
}

function unique(values) {
  return [...new Set(values)]
}

function varied(values, occurrence) {
  if (occurrence % 4 === 1) return [values[0]]
  if (occurrence % 4 === 2) return [values.at(-1)]
  return [...values]
}

function designDna(index, styleIds, contentTypeIds) {
  const seed = (index * 37) % 53
  const has = (items, value) => items.includes(value)
  const score = (base, multiplier) => Math.max(12, Math.min(96, Math.round(base + ((seed * multiplier) % 19) - 9)))
  return {
    minimalism: score(has(styleIds, 'minimal') ? 84 : has(contentTypeIds, 'table') ? 48 : 64, 1),
    corporate: score(has(styleIds, 'corporate') ? 88 : has(styleIds, 'industrial') ? 72 : 61, 2),
    executive: score(has(styleIds, 'executive') ? 90 : has(styleIds, 'consulting') ? 76 : 54, 3),
    modern: score(has(styleIds, 'modern') ? 91 : has(styleIds, 'minimal') ? 78 : 58, 4),
    whitespace: score(has(styleIds, 'minimal') ? 88 : has(contentTypeIds, 'dashboard') ? 51 : 66, 5),
    dataDensity: score(has(contentTypeIds, 'table') || has(contentTypeIds, 'dashboard') ? 86 : has(contentTypeIds, 'cover') ? 24 : 60, 6),
    formality: score(has(styleIds, 'executive') || has(styleIds, 'corporate') ? 88 : has(styleIds, 'industrial') ? 78 : 55, 7),
    visualComplexity: score(has(contentTypeIds, 'process') || has(contentTypeIds, 'dashboard') ? 76 : has(contentTypeIds, 'cover') ? 31 : 59, 8),
  }
}

function tagsFor(reference, theme, context) {
  return unique([
    labels.scenarios[reference.scenarioIds[0]].toLocaleLowerCase('ru'),
    labels.contentTypes[reference.contentTypeIds[0]].toLocaleLowerCase('ru'),
    theme.category.toLocaleLowerCase('ru'),
    context,
  ]).slice(0, 6)
}

function usageFor(reference, context) {
  const persona = labels.personas[reference.personaIds[0]]
  const goal = labels.goals[reference.goalIds[0]]
  return [
    `Нужно раскрыть тему «${context}» для ${persona} на одном содержательном экране.`,
    `Композиция должна помочь ${goal} и сохранить ясную логику обсуждения.`,
    `Исходные данные по теме «${context}» уже проверены и готовы к визуальному обобщению.`,
  ]
}

function avoidanceFor(reference, context) {
  const content = labels.contentTypes[reference.contentTypeIds[0]]
  return [
    `Не подходит, если по теме «${context}» ещё нет согласованных фактов и вывода.`,
    `Не использовать, когда аудитории требуется полный документ, а не формат «${content}».`,
  ]
}

function makeReference(idNumber, title, summary, theme, metadata, context) {
  const id = `REF-${String(idNumber).padStart(6, '0')}`
  const reference = {
    id,
    title,
    summary,
    sourceType: 'synthetic',
    sourceLabel: 'Демонстрационный референс PIP',
    sourceUrl: null,
    previewPath: `previews/${id}.svg`,
    scenarioIds: unique(metadata.scenarioIds),
    personaIds: unique(metadata.personaIds),
    goalIds: unique(metadata.goalIds),
    styleIds: unique(metadata.styleIds),
    contentTypeIds: unique(metadata.contentTypeIds),
    category: theme.category,
    tags: [],
    useWhen: [],
    avoidWhen: [],
    designDna: {},
  }
  reference.tags = tagsFor(reference, theme, context)
  reference.useWhen = usageFor(reference, context)
  reference.avoidWhen = avoidanceFor(reference, context)
  reference.designDna = designDna(idNumber, reference.styleIds, reference.contentTypeIds)
  return reference
}

function buildReferences() {
  const existing = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
  const references = existing.slice(0, 12)

  for (const [index, query] of controlQueries.entries()) {
    const theme = themes[(index * 7 + 3) % themes.length]
    const subject = anchorSubjects[index]
    const scenario = labels.scenarios[query.scenarioId]
    references.push(makeReference(
      13 + index,
      `${scenario}: ${subject}`,
      `${theme.summary} Этот референс соединяет задачу «${scenario}» с целью «${labels.goals[query.goalId]}» для ${labels.personas[query.personaId]}.`,
      theme,
      {
        scenarioIds: [query.scenarioId], personaIds: [query.personaId], goalIds: [query.goalId],
        styleIds: [query.styleId], contentTypeIds: [query.contentTypeId],
      },
      subject,
    ))
  }

  for (let index = 0; index < 64; index += 1) {
    const themeIndex = index % themes.length
    const occurrence = Math.floor(index / themes.length)
    const theme = themes[themeIndex]
    const context = contexts[index]
    const scenarioIds = varied(theme.scenarios, occurrence)
    const personaIds = unique(scenarioIds.flatMap((scenario) => scenarioPersonas[scenario]))
    const goalIds = unique(scenarioIds.flatMap((scenario) => scenarioGoals[scenario]))
    const styleIds = varied(theme.styles, occurrence)
    const contentTypeIds = varied(theme.contentTypes, occurrence)
    if (occurrence === 3 && !styleIds.includes('corporate')) styleIds.push('corporate')
    if (index % 10 === 0 && !styleIds.includes('industrial')) styleIds.push('industrial')

    references.push(makeReference(
      37 + index,
      `${theme.title}: ${context}`,
      `${theme.summary} В центре решения — ${context}, а структура помогает перейти от фактов к следующему действию без лишних деталей.`,
      theme,
      { scenarioIds, personaIds, goalIds, styleIds, contentTypeIds },
      context,
    ))
  }

  for (const [dimension, thresholds] of Object.entries(minimums)) {
    const field = fieldNames[dimension]
    for (const [value, minimum] of Object.entries(thresholds)) {
      let count = references.filter((reference) => reference[field].includes(value)).length
      while (count < minimum) {
        const candidates = compatibility[dimension]?.[value] ?? taxonomy[dimension]
        const reference = references.slice(12)
          .filter((item) => !item[field].includes(value) && item.scenarioIds.some((scenario) => candidates.includes(scenario)))
          .sort((a, b) => a[field].length - b[field].length || a.id.localeCompare(b.id))[0]
        if (!reference) throw new Error(`Unable to satisfy coverage for ${dimension}.${value}.`)
        reference[field].push(value)
        count += 1
      }
    }
  }

  const metadataSignature = (reference) => ['scenarioIds', 'personaIds', 'goalIds', 'styleIds', 'contentTypeIds']
    .map((field) => [...reference[field]].sort().join(','))
    .join('|')
  const signatures = new Set()
  references.forEach((reference, referenceIndex) => {
    let signature = metadataSignature(reference)
    let attempt = 0
    while (signatures.has(signature)) {
      const dimensions = ['styles', 'contentTypes', 'personas', 'goals', 'scenarios']
      const dimension = dimensions[attempt % dimensions.length]
      const field = fieldNames[dimension]
      const values = taxonomy[dimension]
      const candidate = values[(referenceIndex + attempt * 3) % values.length]
      const allowedScenarios = compatibility[dimension]?.[candidate] ?? taxonomy.scenarios
      if (!reference[field].includes(candidate) && reference.scenarioIds.some((scenario) => allowedScenarios.includes(scenario))) {
        reference[field].push(candidate)
        signature = metadataSignature(reference)
      }
      attempt += 1
      if (attempt > 100) throw new Error(`Unable to create unique metadata for ${reference.id}.`)
    }
    signatures.add(signature)
  })

  const preservedSalesQuery = controlQueries[0]
  references.slice(12).forEach((reference) => {
    const isFullSalesMatch = reference.scenarioIds.includes(preservedSalesQuery.scenarioId)
      && reference.personaIds.includes(preservedSalesQuery.personaId)
      && reference.goalIds.includes(preservedSalesQuery.goalId)
      && reference.styleIds.includes(preservedSalesQuery.styleId)
      && reference.contentTypeIds.includes(preservedSalesQuery.contentTypeId)
    if (isFullSalesMatch) {
      reference.styleIds = reference.styleIds.filter((style) => style !== preservedSalesQuery.styleId)
      if (reference.styleIds.length === 0) reference.styleIds.push('corporate')
    }
  })
  let consultingCount = references.filter((reference) => reference.styleIds.includes('consulting')).length
  for (const reference of references.slice(12)) {
    if (consultingCount >= minimums.styles.consulting) break
    const wouldReplaceProtectedSalesResult = reference.scenarioIds.includes(preservedSalesQuery.scenarioId)
      && reference.personaIds.includes(preservedSalesQuery.personaId)
      && reference.goalIds.includes(preservedSalesQuery.goalId)
      && reference.contentTypeIds.includes(preservedSalesQuery.contentTypeId)
    if (!reference.styleIds.includes('consulting') && !wouldReplaceProtectedSalesResult) {
      reference.styleIds.push('consulting')
      consultingCount += 1
    }
  }

  references.slice(12).forEach((reference, index) => {
    reference.designDna = designDna(index + 13, reference.styleIds, reference.contentTypeIds)
  })
  return references
}

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}

const templateNames = ['hero-number', 'dashboard', 'comparison', 'table', 'matrix', 'timeline', 'roadmap', 'process', 'storytelling', 'title', 'risk-map', 'before-after', 'funnel', 'recommendation', 'action-plan']

function templateFor(reference, index) {
  const choices = {
    kpi: ['hero-number', 'dashboard'], comparison: ['comparison', 'matrix', 'before-after'],
    timeline: ['timeline', 'roadmap', 'action-plan'], process: ['process', 'funnel', 'action-plan'],
    dashboard: ['dashboard', 'hero-number'], cover: ['title', 'storytelling'],
    story: ['storytelling', 'recommendation', 'funnel'], table: ['table', 'matrix', 'risk-map'],
  }
  const content = reference.contentTypeIds[0]
  return choices[content]?.[index % choices[content].length] ?? templateNames[index % templateNames.length]
}

function layout(template, accent, pale, index) {
  const n = (index % 7) + 3
  const commonCard = (x, y, width, height) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="24" fill="#FFFFFF" stroke="#D8E2EC" stroke-width="3"/>`
  switch (template) {
    case 'hero-number': return `${commonCard(90, 250, 690, 500)}<text x="145" y="430" font-size="150" font-weight="800" fill="${accent}">${n}8%</text><path d="M150 560 C300 ${500 + n * 5}, 470 ${650 - n * 4}, 700 490" fill="none" stroke="${accent}" stroke-width="18"/><circle cx="700" cy="490" r="18" fill="${accent}"/>${commonCard(830, 250, 680, 230)}${commonCard(830, 520, 680, 230)}`
    case 'dashboard': return `${[0, 1, 2].map((item) => `${commonCard(90 + item * 500, 230, 450, 190)}<rect x="${130 + item * 500}" y="360" width="${180 + ((index + item) % 4) * 45}" height="14" rx="7" fill="${accent}"/>`).join('')}${commonCard(90, 460, 950, 290)}${commonCard(1080, 460, 510, 290)}<path d="M150 690 L280 610 L410 650 L550 525 L690 590 L840 500 L970 550" fill="none" stroke="${accent}" stroke-width="14"/>`
    case 'comparison': return `${commonCard(90, 230, 680, 520)}${commonCard(830, 230, 680, 520)}<rect x="90" y="230" width="680" height="90" rx="24" fill="${pale}"/><rect x="830" y="230" width="680" height="90" rx="24" fill="${accent}" opacity=".18"/>${[0, 1, 2, 3].map((item) => `<circle cx="${150}" cy="${390 + item * 80}" r="12" fill="${accent}"/><rect x="180" y="${380 + item * 80}" width="${350 + item * 30}" height="20" rx="10" fill="#B9C7D4"/><circle cx="890" cy="${390 + item * 80}" r="12" fill="${accent}"/><rect x="920" y="${380 + item * 80}" width="${420 - item * 22}" height="20" rx="10" fill="#B9C7D4"/>`).join('')}`
    case 'table': return `${commonCard(90, 230, 1420, 520)}<rect x="90" y="230" width="1420" height="95" rx="24" fill="${accent}"/>${[1, 2, 3, 4].map((row) => `<path d="M90 ${230 + row * 104}H1510" stroke="#D8E2EC" stroke-width="3"/>`).join('')}${[1, 2, 3].map((column) => `<path d="M${90 + column * 355} 230V750" stroke="#D8E2EC" stroke-width="3"/>`).join('')}${[0, 1, 2].map((item) => `<rect x="${490 + item * 355}" y="${360 + ((index + item) % 4) * 95}" width="190" height="22" rx="11" fill="${accent}" opacity="${0.35 + item * 0.2}"/>`).join('')}`
    case 'matrix': return `${commonCard(190, 230, 1050, 520)}<path d="M715 260V720M220 490H1210" stroke="#B9C7D4" stroke-width="4"/><circle cx="${420 + (index % 4) * 150}" cy="${350 + (index % 3) * 95}" r="58" fill="${accent}" opacity=".85"/><circle cx="920" cy="390" r="42" fill="#F59E0B"/><circle cx="560" cy="620" r="34" fill="${accent}" opacity=".45"/><path d="M1290 330h220M1290 400h170M1290 550h220M1290 620h140" stroke="#8395A7" stroke-width="22" stroke-linecap="round"/>`
    case 'timeline': return `<path d="M150 500H1450" stroke="#B9C7D4" stroke-width="12" stroke-linecap="round"/>${[0, 1, 2, 3, 4].map((item) => `<circle cx="${190 + item * 310}" cy="500" r="42" fill="${item <= index % 5 ? accent : '#FFFFFF'}" stroke="${accent}" stroke-width="8"/>${commonCard(95 + item * 310, item % 2 ? 565 : 270, 190, 120)}`).join('')}`
    case 'roadmap': return `${[0, 1, 2].map((lane) => `<rect x="110" y="${250 + lane * 165}" width="1380" height="115" rx="30" fill="${lane === 1 ? pale : '#FFFFFF'}" stroke="#D8E2EC" stroke-width="3"/><rect x="${180 + ((index + lane) % 3) * 180}" y="${285 + lane * 165}" width="${420 + lane * 130}" height="45" rx="22" fill="${accent}" opacity="${0.9 - lane * 0.2}"/>`).join('')}<path d="M250 725h1100l-35-35m35 35-35 35" stroke="${accent}" stroke-width="12" fill="none" stroke-linecap="round"/>`
    case 'process': return `${[0, 1, 2, 3].map((item) => `${commonCard(80 + item * 385, 330, 300, 260)}<circle cx="${230 + item * 385}" cy="410" r="44" fill="${accent}" opacity="${0.35 + item * 0.15}"/><text x="${230 + item * 385}" y="425" text-anchor="middle" font-size="42" font-weight="800" fill="#082F49">${item + 1}</text>${item < 3 ? `<path d="M390 ${460 + (item % 2) * 35}h55l-18-18m18 18-18 18" stroke="${accent}" stroke-width="10" fill="none"/>` : ''}`).join('')}`
    case 'storytelling': return `<path d="M130 670 C400 620, 460 320, 780 430 S1190 650, 1480 270" fill="none" stroke="${accent}" stroke-width="16"/>${[0, 1, 2, 3].map((item) => `<circle cx="${190 + item * 400}" cy="${item === 1 ? 370 : item === 2 ? 500 : item === 3 ? 300 : 640}" r="34" fill="#FFFFFF" stroke="${accent}" stroke-width="12"/>${commonCard(95 + item * 390, 210 + (item % 2) * 360, 250, 120)}`).join('')}`
    case 'title': return `<rect x="860" y="180" width="620" height="540" rx="70" fill="${pale}"/><circle cx="1210" cy="430" r="210" fill="${accent}" opacity=".18"/><circle cx="1320" cy="300" r="95" fill="#F59E0B" opacity=".8"/><path d="M1020 650 1430 240" stroke="${accent}" stroke-width="22"/><rect x="100" y="630" width="520" height="24" rx="12" fill="${accent}"/><rect x="100" y="685" width="370" height="18" rx="9" fill="#8395A7"/>`
    case 'risk-map': return `${commonCard(140, 230, 960, 520)}${[0, 1, 2].map((item) => `<rect x="${170 + item * 300}" y="260" width="280" height="460" fill="${item === 0 ? '#DCFCE7' : item === 1 ? '#FEF3C7' : '#FEE2E2'}" opacity=".9"/>`).join('')}${[0, 1, 2, 3].map((item) => `<circle cx="${300 + ((index + item) % 3) * 300}" cy="${350 + item * 85}" r="${25 + item * 5}" fill="${accent}" opacity="${0.45 + item * 0.12}"/>`).join('')}${commonCard(1160, 230, 340, 520)}`
    case 'before-after': return `${commonCard(90, 250, 570, 470)}${commonCard(940, 250, 570, 470)}<rect x="90" y="250" width="570" height="85" rx="24" fill="#E5E7EB"/><rect x="940" y="250" width="570" height="85" rx="24" fill="${pale}"/><path d="M705 470h190l-48-48m48 48-48 48" stroke="${accent}" stroke-width="18" fill="none"/>${[0, 1, 2].map((item) => `<rect x="150" y="${390 + item * 90}" width="${280 + item * 35}" height="24" rx="12" fill="#9AA9B8"/><rect x="1000" y="${390 + item * 90}" width="${390 + item * 25}" height="24" rx="12" fill="${accent}" opacity="${0.5 + item * 0.18}"/>`).join('')}`
    case 'funnel': return `${[0, 1, 2, 3].map((item) => `<path d="M${250 + item * 110} ${250 + item * 125}H${1350 - item * 110}L${1250 - item * 110} ${345 + item * 125}H${350 + item * 110}Z" fill="${accent}" opacity="${0.28 + item * 0.17}"/>`).join('')}<circle cx="800" cy="740" r="55" fill="#F59E0B"/><path d="M1180 270h300M1180 340h210M1180 650h300M1180 720h170" stroke="#8395A7" stroke-width="18" stroke-linecap="round"/>`
    case 'recommendation': return `${commonCard(90, 230, 920, 520)}<circle cx="220" cy="370" r="65" fill="${accent}"/><path d="m185 370 25 25 50-58" stroke="#FFFFFF" stroke-width="16" fill="none"/><rect x="330" y="310" width="560" height="28" rx="14" fill="#082F49"/><rect x="330" y="380" width="430" height="20" rx="10" fill="#8395A7"/>${[0, 1, 2].map((item) => `<circle cx="350" cy="${500 + item * 68}" r="10" fill="${accent}"/><rect x="380" y="${490 + item * 68}" width="${420 - item * 45}" height="20" rx="10" fill="#B9C7D4"/>`).join('')}${commonCard(1070, 230, 440, 520)}<path d="m1190 500 75 75 145-185" stroke="${accent}" stroke-width="30" fill="none"/>`
    default: return `${commonCard(90, 240, 1420, 500)}${[0, 1, 2].map((item) => `<circle cx="${270 + item * 480}" cy="390" r="58" fill="${accent}" opacity="${0.35 + item * 0.22}"/><rect x="${160 + item * 480}" y="500" width="310" height="26" rx="13" fill="#8395A7"/><rect x="${190 + item * 480}" y="565" width="250" height="18" rx="9" fill="#B9C7D4"/>`).join('')}<path d="M400 390h220M880 390h220" stroke="${accent}" stroke-width="12"/>`
  }
}

function svgFor(reference, index) {
  const palette = [
    ['#0A78C2', '#E0F2FE'], ['#0F766E', '#CCFBF1'], ['#7C3AED', '#EDE9FE'],
    ['#C2410C', '#FFEDD5'], ['#0369A1', '#E0F2FE'], ['#B45309', '#FEF3C7'],
  ][index % 6]
  const template = templateFor(reference, index)
  const title = escapeXml(reference.title.length > 58 ? `${reference.title.slice(0, 56)}…` : reference.title)
  const category = escapeXml(reference.category)
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="title description">
  <title id="title">${title}</title><desc id="description">Синтетическое превью ${escapeXml(template)} для ${category}</desc>
  <rect width="1600" height="900" fill="#F4F7FB"/><rect width="1600" height="165" fill="#082F49"/>
  <text x="90" y="78" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" letter-spacing="3" fill="${palette[0]}">${escapeXml(reference.id)} · ${escapeXml(template.toLocaleUpperCase('ru'))}</text>
  <text x="90" y="132" font-family="Inter, Arial, sans-serif" font-size="38" font-weight="700" fill="#FFFFFF">${title}</text>
  ${layout(template, palette[0], palette[1], index)}
  <text x="90" y="835" font-family="Inter, Arial, sans-serif" font-size="25" font-weight="600" fill="#52677A">${category}</text>
  <rect x="1410" y="800" width="100" height="38" rx="19" fill="${palette[0]}"/><text x="1460" y="827" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" fill="#FFFFFF">PIP</text>
</svg>
`
}

function writeControlQueries() {
  const serialized = controlQueries.map((query) => `  ${JSON.stringify(query)},`).join('\n')
  const source = `import type { SearchQuery } from '../types/reference'\n\nexport interface ControlQuery extends SearchQuery {\n  id: string\n  minimumScore: number\n}\n\nexport const controlQueries: ControlQuery[] = [\n${serialized}\n]\n`
  fs.writeFileSync(controlsPath, source, 'utf8')
}

const references = previewsOnly ? JSON.parse(fs.readFileSync(dataPath, 'utf8')) : buildReferences()
if (!previewsOnly) {
  fs.writeFileSync(dataPath, `${JSON.stringify(references, null, 2)}\n`, 'utf8')
  writeControlQueries()
}
fs.mkdirSync(previewDirectory, { recursive: true })
for (const [index, reference] of references.entries()) {
  fs.writeFileSync(path.join(previewDirectory, `${reference.id}.svg`), svgFor(reference, index), 'utf8')
}
console.log(`Generated ${references.length} references and ${references.length} deterministic SVG previews.`)
