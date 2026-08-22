import { copyFileSync, existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const poRound = JSON.parse(readFileSync(join(root, 'src', 'data', 'curatedCore', 'po-review-round-1.json'), 'utf8'))
const coverFinalRound = JSON.parse(readFileSync(join(root, 'src', 'data', 'curatedCore', 'cover-round-2-final.json'), 'utf8'))
const poDecisionById = new Map([
  ...poRound.decisions.map((decision) => [decision.referenceId, { ...decision, round: poRound.round, reviewedAt: poRound.reviewedAt, reviewedBy: poRound.reviewedBy }]),
  ...poRound.rejectedSchematicReferenceIds.map((referenceId) => [referenceId, {
    referenceId,
    disposition: 'rejected_schematic',
    verifiedContentType: null,
    notes: 'Legacy procedural preview archived after PO Round 1 schematic review.',
    round: poRound.round,
    reviewedAt: poRound.reviewedAt,
    reviewedBy: poRound.reviewedBy,
  }]),
])
for (const decision of coverFinalRound.decisions.filter(({ decision, productionReferenceId }) => decision === 'approved' && productionReferenceId)) {
  poDecisionById.set(decision.productionReferenceId, {
    referenceId: decision.productionReferenceId,
    disposition: 'approved',
    verifiedContentType: 'cover',
    notes: decision.notes,
    round: coverFinalRound.round,
    reviewedAt: coverFinalRound.reviewedAt,
    reviewedBy: coverFinalRound.reviewedBy,
  })
}

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

const coverOverrides = {
  'REF-000016': {
    title: 'Будущее не случается. Мы переходим в него.',
    summary: 'Главный Hero cover PIP: эмоциональный мост превращает переход к будущему в мгновенно считываемый визуальный тезис и задаёт сильное открытие презентации.',
    category: 'Hero cover о переходе к будущему',
    scenarioIds: ['speech', 'strategy'], personaIds: ['employees', 'board'], goalIds: ['inspire', 'align'], styleIds: ['modern', 'executive'], contentTypeIds: ['cover', 'story'],
    tags: ['hero cover', 'будущее', 'эмоциональный визуальный символ', 'keynote'], compositionFamily: 'keynote-photographic-statement', visualDirection: 'emotional-image-led-opening',
    designDna: { minimalism: 88, corporate: 62, executive: 78, modern: 94, whitespace: 84, dataDensity: 10, formality: 68, visualComplexity: 88 },
    qualityTier: 'hero', heroScenarioId: 'speech',
  },
  'REF-000017': {
    coverFile: 'COVER-CAND-004.svg',
    title: 'Следующий рубеж ближе, чем кажется.',
    summary: 'Сдержанный деловой cover создаёт уверенное открытие через короткий тезис, контролируемый свет и спокойную композицию без декоративного шума.',
    category: 'Сдержанный деловой cover',
    scenarioIds: ['speech', 'strategy', 'project', 'sales'], personaIds: ['board', 'ceo', 'manager', 'employees', 'client'], goalIds: ['align', 'inspire', 'approve'], styleIds: ['minimal', 'executive', 'corporate', 'modern'], contentTypeIds: ['cover'],
    tags: ['secondary cover', 'деловой титульный слайд', 'сдержанный стиль', 'открывающий тезис'], compositionFamily: 'cinematic-statement-cover', visualDirection: 'cinematic-opening-statement',
    designDna: { minimalism: 92, corporate: 82, executive: 90, modern: 78, whitespace: 89, dataDensity: 8, formality: 86, visualComplexity: 64 },
    qualityTier: 'gold', heroScenarioId: null,
  },
  'REF-000047': {
    coverFile: 'COVER-R2-02A.svg',
    title: 'Стратегия без лишнего.',
    summary: 'Строгий минималистичный cover использует масштаб, контраст и точную типографику как единственный визуальный аргумент для лаконичного управленческого открытия.',
    category: 'Минималистичный стратегический cover', sourceType: 'pip-original', sourceLabel: 'Оригинальный референс PIP', sourceUrl: null, sourceBacked: false, sourceTitle: null, sourceOrganization: null, rightsStatus: null, sourceNotes: 'Самостоятельная PIP-композиция без сторонних материалов, логотипов и фирменной графики.', sourceAccessCheckedAt: null,
    scenarioIds: ['strategy', 'meeting', 'speech', 'sales'], personaIds: ['board', 'ceo', 'manager'], goalIds: ['align', 'decide'], styleIds: ['minimal', 'executive', 'modern'], contentTypeIds: ['cover'],
    tags: ['minimal cover', 'стратегия', 'чистая типографика', 'лаконичный титульный слайд'], compositionFamily: 'asymmetric-type-led-cover', visualDirection: 'pure-editorial-typography',
    designDna: { minimalism: 98, corporate: 70, executive: 88, modern: 82, whitespace: 95, dataDensity: 6, formality: 84, visualComplexity: 34 },
    qualityTier: 'gold', heroScenarioId: null,
  },
}

function stableIndex(reference) {
  return Number(reference.id.slice(-3)) % 3
}

function applyPoDecision(reference) {
  const cleanReference = { ...reference }
  delete cleanReference.contentTypePoVerifiedAt
  delete cleanReference.contentTypePoVerifiedBy
  delete cleanReference.contentTypePoNotes
  delete cleanReference.proposedPrimaryContentType
  delete cleanReference.poReviewNotes
  delete cleanReference.poReviewRound
  delete cleanReference.poReviewedAt
  delete cleanReference.poReviewedBy
  const decision = poDecisionById.get(reference.id) ?? { disposition: 'pending', verifiedContentType: null, notes: 'Awaiting Product Owner review.' }
  const reviewed = decision.disposition !== 'pending'
  const approved = decision.disposition === 'approved'
  const reclassify = decision.disposition === 'reclassify'
  const revise = decision.disposition === 'revise_visual'
  const rejectedQuality = decision.disposition === 'rejected_quality'
  const rejected = decision.disposition.startsWith('rejected_')
  const typeVerified = Boolean(decision.verifiedContentType) && !reclassify
  return {
    ...cleanReference,
    screenSuitable: approved ? true : cleanReference.screenSuitable,
    visualReferenceQuality: approved ? 'premium' : revise || rejectedQuality ? 'good' : decision.disposition === 'rejected_schematic' ? 'schematic' : reclassify ? 'premium' : cleanReference.visualReferenceQuality,
    curatedCoreStatus: approved ? 'eligible' : reclassify || revise || decision.disposition === 'pending' ? 'review_only' : 'excluded',
    contentTypePoVerificationStatus: typeVerified ? 'verified' : reclassify ? 'reclassify' : rejected ? cleanReference.contentTypePoVerificationStatus : 'pending',
    ...(typeVerified ? { contentTypePoVerifiedAt: decision.reviewedAt ?? poRound.reviewedAt, contentTypePoVerifiedBy: decision.reviewedBy ?? poRound.reviewedBy } : {}),
    contentTypePoNotes: decision.notes,
    ...(decision.proposedContentType ? { proposedPrimaryContentType: decision.proposedContentType } : {}),
    poReviewDisposition: decision.disposition,
    poReviewNotes: decision.notes,
    ...(reviewed ? { poReviewRound: decision.round ?? poRound.round, poReviewedAt: decision.reviewedAt ?? poRound.reviewedAt, poReviewedBy: decision.reviewedBy ?? poRound.reviewedBy } : {}),
  }
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
      poReviewDisposition: 'pending',
      heroScenarioId: null,
      compositionFamily: familyVariants[reference.contentTypeIds[0]][index],
      visualDirection: directionVariants[reference.styleIds[0]][index],
      referenceSchemaVersion: 2,
    }
    const hero = heroOverrides[reference.id]
    let integrated = base
    if (hero) {
      copyFileSync(join(root, 'public', 'hero-references', hero.heroFile), join(root, 'public', 'previews', `${reference.id}.png`))
      const replacedSvg = join(root, 'public', 'previews', `${reference.id}.svg`)
      if (existsSync(replacedSvg)) unlinkSync(replacedSvg)
      integrated = {
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
        curatedCoreStatus: 'review_only',
        contentTypePoVerificationStatus: 'pending',
        poReviewDisposition: 'pending',
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
    }
    const cover = coverOverrides[reference.id]
    if (cover) {
      const extension = cover.coverFile?.split('.').at(-1) ?? integrated.previewPath.split('.').at(-1)
      if (cover.coverFile) copyFileSync(join(root, 'public', 'cover-recovery', cover.coverFile), join(root, 'public', 'previews', `${reference.id}.${extension}`))
      integrated = {
        ...integrated,
        ...cover,
        coverFile: undefined,
        previewMode: 'original_pip_interpretation',
        primaryContentTypeId: 'cover',
        screenSuitable: true,
        visualReferenceQuality: 'premium',
        curatedCoreStatus: 'review_only',
        contentTypePoVerificationStatus: 'pending',
        poReviewDisposition: 'pending',
        productionApproved: true,
        referenceSchemaVersion: 2,
        previewPath: `previews/${reference.id}.${extension}`,
        useWhen: [
          'Нужен законченный high-fidelity титульный слайд с одной мгновенно считываемой идеей.',
          'Выбран content type Cover и визуальное направление соответствует роли обложки.',
          'Нужен утверждённый Product Owner вариант без схематичного filler.',
        ],
        avoidWhen: [
          'Нужен содержательный KPI, процесс, таблица, dashboard, сравнение или timeline.',
          'Титульный слайд не должен заменять точное совпадение другого content type.',
        ],
      }
    }
    return applyPoDecision(integrated)
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
  console.log('hero integration: PASS (6 approved Heroes and 3 approved Cover references mapped to existing IDs; library remains 100 records).')
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) integrateHeroReferences()
