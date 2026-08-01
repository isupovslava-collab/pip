import { describe, expect, it } from 'vitest'
import { clearFeedbackData, createFeedbackSession, createSessionId, exportFeedbackCsv, exportFeedbackJson, FEEDBACK_STORAGE_KEY, readFeedbackSessions, writeFeedbackSessions } from '../services/feedbackStorage'
import { BOARD_STORAGE_KEY } from '../utils/storage'

describe('локальное хранение и экспорт feedback', () => {
  it('создаёт анонимный sessionId нужного формата', () => {
    expect(createSessionId(new Uint8Array([1, 2, 171, 255]))).toBe('PIP-TEST-0102ABFF')
  })

  it('создаёт уникальные sessionId', () => {
    expect(new Set(Array.from({ length: 50 }, () => createSessionId())).size).toBe(50)
  })

  it('сохраняет feedback между повторными чтениями', () => {
    const session = createFeedbackSession('2026-08-01T00:00:00.000Z', 'PIP-TEST-00000001')
    session.collectionRating = 'useful'
    writeFeedbackSessions([session])
    expect(readFeedbackSessions()).toEqual([session])
  })

  it('сохраняет event log с sessionId и timestamp', () => {
    const session = createFeedbackSession('2026-08-01T00:00:00.000Z', 'PIP-TEST-00000009')
    session.events.push({ type: 'results_viewed', timestamp: '2026-08-01T00:01:00.000Z' })
    writeFeedbackSessions([session])
    const restored = readFeedbackSessions()[0]
    expect(restored.sessionId).toBe('PIP-TEST-00000009')
    expect(restored.events).toEqual([
      { type: 'search_started', timestamp: '2026-08-01T00:00:00.000Z' },
      { type: 'results_viewed', timestamp: '2026-08-01T00:01:00.000Z' },
    ])
  })

  it('создаёт корректный JSON export', () => {
    const session = createFeedbackSession('2026-08-01T00:00:00.000Z', 'PIP-TEST-00000002')
    const exported = exportFeedbackJson([session])
    expect(JSON.parse(exported)).toEqual([session])
    expect(exported.endsWith('\n')).toBe(true)
  })

  it('создаёт Excel-ready CSV: одна строка на сессию и шесть результатов', () => {
    const session = createFeedbackSession('2026-08-01T00:00:00.000Z', 'PIP-TEST-00000003')
    session.query = { scenarioId: 'sales', personaId: 'client', goalId: 'approve', styleId: 'consulting', contentTypeId: 'comparison' }
    session.results = Array.from({ length: 6 }, (_, index) => ({ referenceId: `REF-${String(index + 13).padStart(6, '0')}`, rank: index + 1, score: 100 - index * 5 }))
    session.collectionComment = 'Полезно, но хочется больше таблиц'
    const csv = exportFeedbackCsv([session])
    expect(csv.startsWith('\uFEFFsessionId,')).toBe(true)
    expect(csv).toContain('result6Id,result6Score')
    expect(csv).toContain('REF-000018,75')
    expect(csv.trim().split('\r\n')).toHaveLength(2)
  })

  it('reset удаляет только testing data и сохраняет Inspiration Board', () => {
    localStorage.setItem(FEEDBACK_STORAGE_KEY, '[]')
    localStorage.setItem(BOARD_STORAGE_KEY, JSON.stringify(['REF-000013']))
    clearFeedbackData()
    expect(localStorage.getItem(FEEDBACK_STORAGE_KEY)).toBeNull()
    expect(localStorage.getItem(BOARD_STORAGE_KEY)).toBe(JSON.stringify(['REF-000013']))
  })

  it('не создаёт полей персональных данных', () => {
    const serialized = JSON.stringify(createFeedbackSession()).toLocaleLowerCase()
    for (const forbidden of ['email', 'phone', 'ipaddress', 'geolocation', 'fingerprint', 'participantname']) expect(serialized).not.toContain(forbidden)
  })
})
