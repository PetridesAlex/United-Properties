import type {ReactNode} from 'react'

type Props = {
  title: string
  eyebrow?: string
  lede?: string
  className?: string
  children: ReactNode
}

export default function AdminFormSection({title, eyebrow, lede, className, children}: Props) {
  return (
    <section
      className={['admin-card', 'admin-form__section', className].filter(Boolean).join(' ')}
    >
      <div className="admin-section-head">
        <div>
          {eyebrow ? <p className="admin-section-head__eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {lede ? <p className="admin-section-head__lede">{lede}</p> : null}
      </div>
      {children}
    </section>
  )
}
