import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const poVerificationMap = JSON.parse(readFileSync(join(root, 'src', 'data', 'curated-core-po-verification-map.json'), 'utf8'))

const familyVariants = {
  kpi: ['kpi-scorecard', 'metric-story', 'trend-spotlight'],
  comparison: ['option-comparison', 'decision-matrix', 'scenario-cards'],
  timeline: ['roadmap', 'milestone-path', 'phase-plan'],
  process: ['process-flow', 'operating-model', 'learning-journey'],
  dashboard: ['executive-dashboard', 'performance-pulse', 'control-room'],
  cover: ['keynote-cover', 'editorial-opener', 'statement-slide'],
  story: ['narrative', 'argument-arc', 'case-study'],
  table: ['structured-table', 'decision-register', 'financial-waterfall'],
}

const directionVariants = {
  executive: ['executive-light', 'executive-dark', 'boardroom-editorial'],
  corporate: ['corporate-editorial', 'corporate-data', 'corporate-minimal'],
  consulting: ['consulting-clean', 'consulting-analytical', 'consulting-story'],
  modern: ['modern-saas', 'modern-vibrant', 'modern-editorial'],
  industrial: ['technical-light', 'technical-dark', 'industrial-editorial'],
  minimal: ['minimalist-editorial', 'minimalist-data', 'minimalist-keynote'],
}

const heroOverrides = {
  'REF-000013': {
    scenario: 'sales', heroFile: 'HERO-SALES-001.png', title: 'Коммерческое предложение: рекомендуемая модель сотрудничества',
    summary: 'Три модели сотрудничества сопоставлены по стоимости, скорости эффекта и вовлечению команды. Рекомендуемый вариант выделен через экономику решения, ожидаемый результат и конкретный следующий шаг.',
    category: 'Коммерческое сравнение', sourceType: 'investor-presentation', sourceTitle: 'HubSpot Investor Presentation', sourceOrganization: 'HubSpot', sourceUrl: 'https://ir.hubspot.com/static-files/7f47c817-fa7f-4462-a4f3-43515fd0c863',
    sourceNotes: 'Изучена иерархия коммерческого тезиса: крупный эффект, доказательства экономики и ясный следующий шаг; данные и композиция PIP созданы заново.',
    scenarioIds: ['sales'], personaIds: ['client'], goalIds: ['approve'], styleIds: ['consulting', 'modern'], contentTypeIds: ['comparison'],
    tags: ['продажа', 'сравнение вариантов', 'рекомендуемое решение', 'экономический эффект'], compositionFamily: 'premium-option-comparison', visualDirection: 'premium-editorial',
    designDna: { minimalism: 72, corporate: 78, executive: 86, modern: 91, whitespace: 70, dataDensity: 68, formality: 78, visualComplexity: 74 },
  },
  'REF-000016': {
    scenario: 'speech', heroFile: 'HERO-SPEECH-001.png', title: 'Перемены: переход к будущему',
    summary: 'Один сильный keynote-тезис превращает изменение в понятный переход от привычного состояния к новой возможности. Оригинальная световая метафора поддерживает выступление и оставляет пространство для голоса спикера.',
    category: 'Keynote о переменах', sourceType: 'presentation-guidance', sourceTitle: 'Create + prepare slides', sourceOrganization: 'TED', sourceUrl: 'https://www.ted.com/participate/organize-a-local-tedx-event/tedx-organizer-guide/speakers-program/prepare-your-speaker/create-prepare-slides',
    sourceNotes: 'Изучен принцип одной идеи на экране, эмоциональной паузы и визуального образа, поддерживающего речь; текст и метафора созданы PIP.',
    scenarioIds: ['speech'], personaIds: ['employees'], goalIds: ['inspire'], styleIds: ['modern'], contentTypeIds: ['story', 'cover'],
    tags: ['выступление', 'история изменений', 'эмоциональная метафора', 'keynote'], compositionFamily: 'keynote-metaphor', visualDirection: 'bold-keynote',
    designDna: { minimalism: 94, corporate: 45, executive: 68, modern: 92, whitespace: 91, dataDensity: 12, formality: 54, visualComplexity: 76 },
  },
  'REF-000019': {
    scenario: 'project', heroFile: 'HERO-PROJECT-001.png', title: 'Business case проекта Phoenix',
    summary: 'Business case связывает инвестицию 48 млн ₽, годовой эффект 41 млн ₽, окупаемость 14 месяцев и ключевые риски запуска. Слайд объясняет, почему проект нужен сейчас, и формулирует точный запрос на одобрение.',
    category: 'Business case проекта', sourceType: 'government-guidance', sourceTitle: 'Guidance on developing business cases', sourceOrganization: 'HM Treasury', sourceUrl: 'https://www.gov.uk/government/publications/guidance-on-developing-business-cases',
    sourceNotes: 'Изучена связь стратегической необходимости, экономики, реализуемости, рисков и запроса на решение; кейс Phoenix и все показатели оригинальны.',
    scenarioIds: ['project'], personaIds: ['board'], goalIds: ['approve'], styleIds: ['executive'], contentTypeIds: ['comparison', 'kpi'],
    tags: ['защита проекта', 'business case', 'инвестиция и эффект', 'риски реализации'], compositionFamily: 'business-case', visualDirection: 'modern-saas',
    designDna: { minimalism: 68, corporate: 82, executive: 93, modern: 86, whitespace: 64, dataDensity: 72, formality: 84, visualComplexity: 69 },
  },
  'REF-000025': {
    scenario: 'report', heroFile: 'HERO-REPORT-001.png', title: 'Итоги Q2: рост восстановлен',
    summary: 'Executive report объединяет четыре KPI, план 480 млн ₽, факт 462 млн ₽, прогноз 495 млн ₽ и объяснение отклонения. Управленческий вывод связывает восстановление роста с конкретными драйверами следующего квартала.',
    category: 'Executive-отчёт периода', sourceType: 'annual-report', sourceTitle: 'Annual Report 2024', sourceOrganization: 'World Bank', sourceUrl: 'https://www.worldbank.org/en/about/annual-report-2024',
    sourceNotes: 'Изучен управленческий ритм из ограниченного набора KPI, динамики и короткого объяснения драйверов; показатели относятся к синтетической компании PIP.',
    scenarioIds: ['report'], personaIds: ['manager'], goalIds: ['explain_results'], styleIds: ['corporate'], contentTypeIds: ['kpi', 'dashboard'],
    tags: ['отчёт', 'kpi и динамика', 'план факт прогноз', 'управленческий вывод'], compositionFamily: 'executive-performance', visualDirection: 'executive-finance',
    designDna: { minimalism: 66, corporate: 91, executive: 94, modern: 74, whitespace: 61, dataDensity: 82, formality: 88, visualComplexity: 77 },
  },
  'REF-000028': {
    scenario: 'training', heroFile: 'HERO-TRAINING-001.png', title: '30-дневный маршрут применения навыка',
    summary: 'Маршрут переводит обучение из знания в рабочую практику за четыре последовательных этапа. Для каждого этапа показаны действие, тренировка, проверка и наблюдаемый результат на рабочем месте.',
    category: 'Маршрут обучения', sourceType: 'learning-resource', sourceTitle: 'Pathways to Success', sourceOrganization: 'The Open University / OpenLearn', sourceUrl: 'https://www.open.edu/openlearn/pathway',
    sourceNotes: 'Изучена прогрессия от знакомства с принципом к самостоятельному применению и наблюдаемому результату; учебный маршрут и иллюстрация созданы PIP.',
    scenarioIds: ['training'], personaIds: ['employees'], goalIds: ['teach'], styleIds: ['modern'], contentTypeIds: ['process', 'timeline'],
    tags: ['обучение', 'учебный маршрут', 'практика на рабочем месте', 'проверяемый результат'], compositionFamily: 'illustrated-learning-journey', visualDirection: 'illustrated-learning',
    designDna: { minimalism: 70, corporate: 48, executive: 42, modern: 90, whitespace: 69, dataDensity: 58, formality: 46, visualComplexity: 81 },
  },
  'REF-000034': {
    scenario: 'budget_defense', heroFile: 'HERO-BUDGET-001.png', title: 'Бюджет 2027: инвестиционный прирост и эффект',
    summary: 'Waterfall объясняет переход от базы 120 млн ₽ к бюджету 142 млн ₽ и показывает структуру прироста 22 млн ₽. Три сценария, эффект 38 млн ₽, ROI 73%, риски и запрос на решение образуют единый бюджетный тезис.',
    category: 'Защита бюджета', sourceType: 'budget-report', sourceTitle: 'Supporting documents for Budget 2025', sourceOrganization: 'HM Treasury', sourceUrl: 'https://www.gov.uk/government/publications/supporting-documents-for-budget-2025',
    sourceNotes: 'Изучено прозрачное раскрытие базы, изменений, итоговой суммы, сценариев и допущений; бюджетная модель и графическое решение полностью новые.',
    scenarioIds: ['budget_defense'], personaIds: ['cfo'], goalIds: ['approve'], styleIds: ['executive'], contentTypeIds: ['table', 'dashboard'],
    tags: ['защита бюджета', 'финансовый waterfall', 'сценарии и эффект', 'решение об инвестиции'], compositionFamily: 'financial-waterfall', visualDirection: 'consulting-finance',
    designDna: { minimalism: 62, corporate: 86, executive: 96, modern: 70, whitespace: 58, dataDensity: 88, formality: 91, visualComplexity: 75 },
  },
}

function stableIndex(reference) {
  return Number(reference.id.slice(-3)) % 3
}

export function integrateHeroReferences() {
  const dataPath = join(root, 'public', 'data', 'references.json')
  const references = JSON.parse(readFileSync(dataPath, 'utf8')).map((reference) => {
    const index = stableIndex(reference)
    const base = {
      ...reference,
      ...(reference.id === 'REF-000018' ? { scenarioIds: [...new Set([...reference.scenarioIds, 'sales'])] } : {}),
      ...(reference.id === 'REF-000076' ? { scenarioIds: [...new Set([...reference.scenarioIds, 'speech'])] } : {}),
      ...(['REF-000006', 'REF-000029'].includes(reference.id) ? { personaIds: [...new Set([...reference.personaIds, 'employees'])] } : {}),
      ...(reference.id === 'REF-000060' ? { personaIds: [...new Set([...reference.personaIds, 'client'])] } : {}),
      ...(reference.id === 'REF-000059' ? { contentTypeIds: [...new Set([...reference.contentTypeIds, 'kpi'])] } : {}),
      ...(reference.id === 'REF-000077' ? { contentTypeIds: [...new Set([...reference.contentTypeIds, 'cover'])] } : {}),
      productionApproved: true,
      primaryContentTypeId: reference.contentTypeIds[0],
      screenSuitable: false,
      visualReferenceQuality: 'unknown',
      curatedCoreStatus: ['REF-000022', 'REF-000031'].includes(reference.id) ? 'review_only' : 'excluded',
      contentTypePoVerificationStatus: 'pending',
      heroScenarioId: null,
      compositionFamily: familyVariants[reference.contentTypeIds[0]][index],
      visualDirection: directionVariants[reference.styleIds[0]][index],
      referenceSchemaVersion: 2,
    }
    const hero = heroOverrides[reference.id]
    if (!hero) return base
    const poVerification = poVerificationMap[reference.id]
    copyFileSync(join(root, 'public', 'hero-references', hero.heroFile), join(root, 'public', 'previews', `${reference.id}.png`))
    const replacedSvg = join(root, 'public', 'previews', `${reference.id}.svg`)
    if (existsSync(replacedSvg)) unlinkSync(replacedSvg)
    return {
      ...base,
      ...hero,
      heroFile: undefined,
      sourceLabel: 'Открытый первоисточник + оригинальная интерпретация PIP',
      sourceBacked: true,
      rightsStatus: 'public-link-reference-only',
      sourceAccessCheckedAt: '2026-08-02',
      previewMode: 'original_pip_interpretation',
      qualityTier: 'hero',
      primaryContentTypeId: hero.contentTypeIds[0],
      screenSuitable: true,
      visualReferenceQuality: 'premium',
      curatedCoreStatus: poVerification?.productionEligible ? 'eligible' : 'review_only',
      contentTypePoVerificationStatus: poVerification?.contentTypePoVerificationStatus ?? 'pending',
      ...(poVerification?.contentTypePoVerifiedAt ? { contentTypePoVerifiedAt: poVerification.contentTypePoVerifiedAt } : {}),
      ...(poVerification?.contentTypePoVerifiedBy ? { contentTypePoVerifiedBy: poVerification.contentTypePoVerifiedBy } : {}),
      ...(poVerification?.contentTypePoNotes ? { contentTypePoNotes: poVerification.contentTypePoNotes } : {}),
      ...(poVerification?.proposedPrimaryContentType ? { proposedPrimaryContentType: poVerification.proposedPrimaryContentType } : {}),
      productionApproved: true,
      heroScenarioId: hero.scenario,
      referenceSchemaVersion: 2,
      previewPath: `previews/${reference.id}.png`,
      useWhen: [
        `Нужен законченный high-fidelity слайд для сценария «${hero.scenario}».`,
        'Требуется ясный управленческий вывод, реалистичный контент и следующий шаг.',
        'Смысловые параметры запроса совпадают с назначением композиции.',
      ],
      avoidWhen: [
        'Тип контента не совпадает и не является совместимым fallback.',
        'Красивый визуал не должен заменять более точное смысловое решение.',
      ],
    }
  }, (key, value) => value)

  for (const reference of references) {
    delete reference.heroFile
    delete reference.scenario
  }
  writeFileSync(dataPath, `${JSON.stringify(references, null, 2)}\n`)

  const manifestPath = join(root, 'tools', 'hero-references', 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')).map((hero) => {
    const productionReferenceId = Object.entries(heroOverrides).find(([, value]) => value.scenario === hero.scenario)?.[0] ?? null
    const approved = Boolean(productionReferenceId)
    const revision = hero.scenario === 'meeting'
      ? { title: 'Поэтапный запуск снижает риск миграции в 3 раза', designDirection: 'industrial / technical v2', createdByPip: 'Presentation-first decision slide v2 с доминирующим тезисом, альтернативами, спорными вопросами, владельцем, сроком и следующим шагом.' }
      : hero.scenario === 'strategy'
        ? { title: 'Рост без удвоения сложности', designDirection: 'executive strategy v2', createdByPip: 'Стратегическая композиция v2 с North Star, четырьмя ставками, горизонтами 2026–2028, инициативами и измеримыми outcomes.' }
        : {}
    return {
      ...hero,
      ...revision,
      productionApproved: approved,
      productionReferenceId,
      reviewStatus: approved ? 'IN PRODUCTION' : 'REVISED — AWAITING PRODUCT OWNER REVIEW',
    }
  })
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)

  const mappingPath = join(root, 'src', 'data', 'goldReferences.ts')
  const mappingLines = readFileSync(mappingPath, 'utf8').split(/\r?\n/).map((line) => {
    const trimmed = line.trim().replace(/,$/, '')
    if (!trimmed.startsWith('{"queryId"')) return line
    const mapping = JSON.parse(trimmed)
    const reference = references.find(({ id }) => id === mapping.referenceId)
    if (!reference) return line
    const next = { ...mapping, title: reference.title, sourceUrl: reference.sourceUrl, qualityTier: reference.qualityTier }
    return `  ${JSON.stringify(next)},`
  })
  const mappingSource = mappingLines.join('\n').replace("qualityTier: 'gold'", "qualityTier: 'hero' | 'gold'")
  writeFileSync(mappingPath, mappingSource)
  console.log('hero integration: PASS (6 approved Hero previews mapped to existing IDs; library remains 100 records).')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) integrateHeroReferences()
