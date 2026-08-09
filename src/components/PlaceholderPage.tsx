import type { ReactNode } from 'react'

export function PlaceholderPage({ kicker, title, text, children }: { kicker: string; title: string; text: string; children?: ReactNode }) {
  return <div className="placeholder-page"><small>{kicker}</small><h1>{title}</h1><p>{text}</p><div className="placeholder-panel">{children ?? 'Экран появится в следующем спринте. Каркас уже зафиксирован в архитектуре V1.'}</div></div>
}
