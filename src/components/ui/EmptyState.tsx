import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  children?: ReactNode
  as?: 'div' | 'li'
}

export function EmptyState({
  title,
  children,
  as: Tag = 'div',
}: EmptyStateProps) {
  return (
    <Tag className="empty-state">
      <h3>{title}</h3>
      {children}
    </Tag>
  )
}
