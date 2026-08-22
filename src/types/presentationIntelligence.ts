import type { ContentTypeId } from './reference'

export type AnatomyPriority = 'primary' | 'secondary' | 'supporting'

export interface IntelligenceInsight {
  title: string
  explanation: string
}

export interface SlideAnatomyItem {
  role: string
  label: string
  purpose: string
  priority: AnatomyPriority
}

export interface ContentMappingItem {
  slot: string
  currentRole: string
  replaceWith: string
  required: boolean
}

export interface ReferenceIntelligenceV1 {
  schemaVersion: 1
  referenceId: string
  contentTypeId: ContentTypeId
  visualPrinciple: string
  whyItWorks: IntelligenceInsight[]
  anatomy: SlideAnatomyItem[]
  hierarchy: {
    primary: string
    secondary: string
    supporting: string[]
  }
  contentMapping: ContentMappingItem[]
  adaptation: {
    preserve: string[]
    replace: string[]
    avoid: string[]
  }
  bestFor: string[]
  lessSuitableFor?: string[]
  designBrief: {
    layout: string
    emphasis: string
    visualMood: string
    contentLogic: string
    constraints: string[]
  }
}
