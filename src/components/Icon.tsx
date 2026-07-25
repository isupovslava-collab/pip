import type { ReactNode } from 'react'

type IconName = 'arrow-left' | 'arrow-right' | 'bookmark' | 'check' | 'edit' | 'insight' | 'sparkles' | 'warning'

interface IconProps {
  name: IconName
  className?: string
}

const paths: Record<IconName, ReactNode> = {
  'arrow-left': <><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>,
  'arrow-right': <><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></>,
  bookmark: <path d="M6 4.8A1.8 1.8 0 0 1 7.8 3h8.4A1.8 1.8 0 0 1 18 4.8V21l-6-3.6L6 21V4.8Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
  insight: <><path d="M4 19V9" /><path d="M10 19V5" /><path d="M16 19v-7" /><path d="M22 19V2" /></>,
  sparkles: <><path d="m12 3-1.1 3.2a4 4 0 0 1-2.5 2.5L5 10l3.4 1.2a4 4 0 0 1 2.5 2.5L12 17l1.1-3.3a4 4 0 0 1 2.5-2.5L19 10l-3.4-1.3a4 4 0 0 1-2.5-2.5Z" /><path d="m19 16-.5 1.4a2 2 0 0 1-1.1 1.1L16 19l1.4.5a2 2 0 0 1 1.1 1.1L19 22l.5-1.4a2 2 0 0 1 1.1-1.1L22 19l-1.4-.5a2 2 0 0 1-1.1-1.1Z" /></>,
  warning: <><path d="M10.3 3.7 2.8 17a2 2 0 0 0 1.7 3h15a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
}

export function Icon({ name, className = 'h-5 w-5' }: IconProps) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>{paths[name]}</svg>
}

export function OptionMarker({ index }: { index: number }) {
  const variant = index % 4
  return (
    <svg aria-hidden="true" viewBox="0 0 40 40" className="h-10 w-10" fill="none">
      <rect x="3" y="5" width="34" height="30" rx="5" className="fill-white/80 stroke-current" strokeWidth="1.5" />
      {variant === 0 && <><rect x="8" y="10" width="11" height="20" rx="2" fill="currentColor" opacity=".2" /><path d="M23 13h9M23 19h7M23 25h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
      {variant === 1 && <><path d="M9 28V18M16 28V12M23 28v-7M30 28V9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M8 31h24" stroke="currentColor" opacity=".35" /></>}
      {variant === 2 && <><circle cx="13" cy="15" r="4" fill="currentColor" opacity=".35" /><circle cx="27" cy="25" r="4" fill="currentColor" opacity=".8" /><path d="m16 18 8 5" stroke="currentColor" strokeWidth="2" /><path d="M9 28h9M22 12h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>}
      {variant === 3 && <><rect x="8" y="10" width="24" height="5" rx="2" fill="currentColor" opacity=".25" /><rect x="8" y="18" width="15" height="12" rx="2" fill="currentColor" opacity=".7" /><rect x="26" y="18" width="6" height="12" rx="2" fill="currentColor" opacity=".3" /></>}
    </svg>
  )
}
