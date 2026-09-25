import type { ReactNode } from 'react'

interface SettingRowProps {
  title: ReactNode
  description: ReactNode
  children?: ReactNode
}

export function SettingRow({ title, description, children }: SettingRowProps) {
  return (
    <div className="setrow">
      <div>
        <p>{title}</p>
        <small>{description}</small>
      </div>
      {children}
    </div>
  )
}
