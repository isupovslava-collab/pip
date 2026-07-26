import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function preview(id: number) {
  return fs.readFileSync(path.resolve('public', 'previews', `REF-${String(id).padStart(6, '0')}.svg`), 'utf8')
}

describe('арифметика и содержательность Gold previews', () => {
  it('согласует итог квартальной выручки с четырьмя кварталами', () => {
    expect(94 + 111 + 128 + 153).toBe(486)
    expect(preview(25)).toContain('486 млн ₽')
  })

  it('согласует cash flow с операционным, инвестиционным и финансовым потоками', () => {
    expect(214 - 96 + 68).toBe(186)
    expect(preview(26)).toContain('186 млн ₽')
  })

  it('согласует Pareto причин SLA', () => {
    expect(42 + 27 + 18 + 9 + 4).toBe(100)
    expect(42 + 27).toBe(69)
    expect(preview(27)).toContain('69% отклонений')
  })

  it('согласует статьи бюджета и эффекта', () => {
    expect(8.4 + 14.8 + 5.6 + 2.1 + 3.4).toBeCloseTo(34.3)
    expect(12.1 + 18.6 + 7.4 + 3.8 + 10.8).toBeCloseTo(52.7)
    expect(preview(34)).toContain('52,7')
  })

  it('согласует мост NPV инвестиционного тезиса', () => {
    expect(-34.3 + 26.4 + 25.7 - 5.2).toBeCloseTo(12.6)
    expect(preview(36)).toContain('12,6 млн ₽')
  })
})

