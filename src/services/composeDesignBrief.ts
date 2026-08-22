import { labels } from '../data/dictionaries.ts'
import type { Reference } from '../types/reference'
import type { SearchQuery } from '../types/reference'
import type { ReferenceIntelligenceV1 } from '../types/presentationIntelligence'

function bullets(items: string[]): string {
  return items.map((item) => `— ${item}`).join('\n')
}

export function composeDesignBrief(reference: Reference, intelligence: ReferenceIntelligenceV1, query?: SearchQuery | null): string {
  const context = query
    ? [`Сценарий: ${labels.scenario[query.scenarioId]}`, `Аудитория: ${labels.persona[query.personaId]}`, `Цель: ${labels.goal[query.goalId]}`, `Стиль: ${labels.style[query.styleId]}`].join('\n')
    : 'Контекст мастера не задан. Уточните аудиторию, цель и стиль перед финальной адаптацией.'
  const structure = intelligence.anatomy.map(({ label, purpose }) => `${label}: ${purpose}`)
  const mapping = intelligence.contentMapping.map(({ slot, replaceWith, required }) => `${slot} → ${replaceWith}${required ? '' : ' (при необходимости)'}`)

  return [
    'ЗАДАЧА',
    `Создать слайд типа «${labels.contentType[intelligence.contentTypeId]}», используя переносимый принцип ${reference.id}.`,
    '',
    'КОНТЕКСТ',
    context,
    `Тип слайда: ${labels.contentType[intelligence.contentTypeId]}`,
    '',
    'ВИЗУАЛЬНЫЙ ПРИНЦИП',
    intelligence.visualPrinciple,
    '',
    'СТРУКТУРА',
    bullets(structure),
    '',
    'СОХРАНИТЬ',
    bullets(intelligence.adaptation.preserve),
    '',
    'ЗАМЕНИТЬ СВОИМИ ДАННЫМИ',
    bullets(mapping),
    '',
    'ИЗБЕГАТЬ',
    bullets(intelligence.adaptation.avoid),
    '',
    'ДИЗАЙН-НАСТРОЙКИ',
    `Макет: ${intelligence.designBrief.layout}`,
    `Акцент: ${intelligence.designBrief.emphasis}`,
    `Визуальный характер: ${intelligence.designBrief.visualMood}`,
    `Логика содержания: ${intelligence.designBrief.contentLogic}`,
    `Ограничения:\n${bullets(intelligence.designBrief.constraints)}`,
    '',
    'ПРИНЦИП АДАПТАЦИИ',
    'Перенесите композиционную логику и информационную иерархию. Не копируйте конкретные данные, текст, брендинг, логотипы, изображения или точную пиксельную раскладку исходного референса.',
  ].join('\n')
}
