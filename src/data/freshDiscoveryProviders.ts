export const freshDiscoveryProviderIds = ['chatgpt', 'gemini', 'perplexity', 'other'] as const

export type FreshDiscoveryProviderId = (typeof freshDiscoveryProviderIds)[number]

export interface FreshDiscoveryProvider {
  id: FreshDiscoveryProviderId
  label: string
  url: string | null
  supportsOpen: boolean
}

export const freshDiscoveryProviders: FreshDiscoveryProvider[] = [
  { id: 'chatgpt', label: 'ChatGPT', url: 'https://chatgpt.com/', supportsOpen: true },
  { id: 'gemini', label: 'Gemini', url: 'https://gemini.google.com/', supportsOpen: true },
  { id: 'perplexity', label: 'Perplexity', url: 'https://www.perplexity.ai/', supportsOpen: true },
  { id: 'other', label: 'Другая нейросеть', url: null, supportsOpen: false },
]

export function getFreshDiscoveryProvider(providerId: FreshDiscoveryProviderId) {
  return freshDiscoveryProviders.find(({ id }) => id === providerId)!
}
