export function isTestMode(search: string): boolean {
  return new URLSearchParams(search).get('test') === '1'
}

