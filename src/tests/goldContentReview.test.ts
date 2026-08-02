import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function preview(id: number) {
  return fs.readFileSync(path.resolve('public', 'previews', `REF-${String(id).padStart(6, '0')}.svg`), 'utf8')
}

function heroSource(folder: string) {
  return fs.readFileSync(path.resolve('tools', 'hero-references', folder, 'index.html'), 'utf8')
}

describe('арифметика и содержательность Gold previews', () => {
  it('согласует итог квартальной выручки с четырьмя кварталами', () => {
    expect(-23 + 9 - 4).toBe(-18)
    expect(462 / 480).toBeCloseTo(0.9625)
    expect(heroSource('report')).toContain('462')
    expect(heroSource('report')).toContain('495')
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
    expect(120 + 18 + 12 + 9 - 17).toBe(142)
    expect((38 - 22) / 22).toBeCloseTo(0.727)
    expect(heroSource('budget-defense')).toContain('142')
    expect(heroSource('budget-defense')).toContain('73%')
  })

  it('согласует мост NPV инвестиционного тезиса', () => {
    expect(-34.3 + 26.4 + 25.7 - 5.2).toBeCloseTo(12.6)
    expect(preview(36)).toContain('12,6 млн ₽')
  })
})
