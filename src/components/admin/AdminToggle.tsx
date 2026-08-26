import type {InputHTMLAttributes} from 'react'

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> & {
  label: string
  description?: string
  onChange: (checked: boolean) => void
  variant?: 'card' | 'chip'
}

export default function AdminToggle({
  label,
  description,
  checked = false,
  onChange,
  variant = 'card',
  className,
  disabled,
  ...rest
}: Props) {
  return (
    <label
      className={[
        'admin-toggle',
        variant === 'chip' ? 'admin-toggle--chip' : 'admin-toggle--card',
        checked ? 'is-checked' : '',
        disabled ? 'is-disabled' : '',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        type="checkbox"
        className="admin-toggle__input"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span className="admin-toggle__control" aria-hidden />
      <span className="admin-toggle__content">
        <span className="admin-toggle__label">{label}</span>
        {description && variant === 'card' ? (
          <span className="admin-toggle__desc">{description}</span>
        ) : null}
      </span>
    </label>
  )
}
