import { comparisonIntelligence } from './comparison.ts'
import { coverIntelligence } from './cover.ts'
import { dashboardIntelligence } from './dashboard.ts'
import { kpiIntelligence } from './kpi.ts'
import { processIntelligence } from './process.ts'
import { storyIntelligence } from './story.ts'
import { tableIntelligence } from './table.ts'
import { timelineIntelligence } from './timeline.ts'

export const presentationIntelligenceV1 = [
  ...kpiIntelligence,
  ...comparisonIntelligence,
  ...timelineIntelligence,
  ...processIntelligence,
  ...dashboardIntelligence,
  ...coverIntelligence,
  ...storyIntelligence,
  ...tableIntelligence,
]

export const presentationIntelligenceById = new Map(presentationIntelligenceV1.map((item) => [item.referenceId, item]))
