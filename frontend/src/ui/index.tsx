import { forwardRef } from 'react'
import type { HTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, ButtonHTMLAttributes } from 'react'

const PRIMARY = '#3dbb6b'
const PRIMARY_DARK = '#2f9a56'
const BORDER = '#e5e7eb'
const TEXT = '#111827'
const SUBTEXT = '#6b7280'
const BG = '#ffffff'

export function Container({ children, center = false, ...rest }: { children: ReactNode; center?: boolean } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        margin: '0 auto',
        padding: 16,
        width: '100%',
        maxWidth: 960,
        display: center ? 'flex' : undefined,
        minHeight: center ? '100vh' : undefined,
        alignItems: center ? 'center' : undefined,
        justifyContent: center ? 'center' : undefined,
        ...rest.style,
      }}
    >
      {children}
    </div>
  )
}

export function Card({ children, ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      style={{
        background: BG,
        border: `1px solid ${BORDER}`,
        borderRadius: 24,
        padding: 20,
        boxShadow: rest.style?.boxShadow ?? '0 8px 24px rgba(16,24,40,0.05)',
        transition: 'box-shadow 200ms ease-in-out, transform 200ms ease-in-out',
        ...rest.style,
      }}
    >
      {children}
    </div>
  )
}

export function Heading({ children }: { children: ReactNode }) {
  return <h1 style={{ fontSize: 28, margin: 0, color: TEXT }}>{children}</h1>
}

export function Subtext({ children, color, ...rest }: { children: ReactNode; color?: 'error' } & HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p {...rest} style={{ margin: 0, marginTop: 4, color: color === 'error' ? '#b91c1c' : SUBTEXT, ...rest.style }}>
      {children}
    </p>
  )
}

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'ghost'; children: ReactNode }) {
  const { variant = 'solid', children, ...rest } = props as any
  const base = {
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid transparent',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
    transition: 'background-color 150ms ease-in-out, border-color 150ms ease-in-out',
  } as const
  const style =
    variant === 'ghost'
      ? { ...base, background: 'transparent', borderColor: BORDER, color: TEXT }
      : { ...base, background: PRIMARY, color: 'white' }
  const hover = variant === 'ghost' ? { background: '#f9fafb' } : { background: PRIMARY_DARK }

  return (
    <button
      {...(rest as any)}
      onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, hover)}
      onMouseLeave={(e) => Object.assign((e.currentTarget as HTMLButtonElement).style, style)}
      style={{ ...style, ...(rest as any).style }}
    >
      {children}
    </button>
  )
}

export function HoverBox({ children, ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      onMouseEnter={(e) =>
        Object.assign((e.currentTarget as HTMLDivElement).style, { boxShadow: '0 10px 24px rgba(16,24,40,0.08)', transform: 'translateY(-2px)' })
      }
      onMouseLeave={(e) =>
        Object.assign((e.currentTarget as HTMLDivElement).style, { boxShadow: '0 6px 18px rgba(16,24,40,0.04)', transform: 'translateY(0px)' })
      }
      style={{
        transition: 'box-shadow 160ms ease, transform 160ms ease',
        ...rest.style,
      }}
    >
      {children}
    </div>
  )
}

export function Interactive({ children, ...rest }: { children: ReactNode } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...rest}
      onMouseEnter={(e) => Object.assign((e.currentTarget as HTMLDivElement).style, { transform: 'scale(1.03)' })}
      onMouseLeave={(e) => Object.assign((e.currentTarget as HTMLDivElement).style, { transform: 'scale(1)' })}
      style={{
        transition: 'transform 160ms ease',
        ...rest.style,
      }}
    >
      {children}
    </div>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 13, color: SUBTEXT }}>{label}</span>
      {children}
    </label>
  )
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { style, ...rest },
  ref
) {
  return (
    <input
      ref={ref}
      {...rest}
      style={{
        width: '100%',
        padding: '10px 12px',
        borderRadius: 10,
        border: `1px solid ${BORDER}`,
        outline: 'none',
        fontSize: 14,
        color: TEXT,
        ...style,
      }}
    />
  )
})

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { options: { label: string; value: string }[] }>(
  function Select({ style, options, ...rest }, ref) {
    return (
      <select
        ref={ref}
        {...rest}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 10,
          border: `1px solid ${BORDER}`,
          outline: 'none',
          fontSize: 14,
          color: TEXT,
          background: 'white',
          ...style,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
)

export function Checkbox({ checked, onChange, children }: { checked: boolean; onChange: React.ChangeEventHandler<HTMLInputElement>; children: ReactNode }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span style={{ fontSize: 14, color: TEXT }}>{children}</span>
    </label>
  )
}

export function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, border: `1px solid ${BORDER}`, borderRadius: 10, padding: 8 }}>
      {values.map((v, i) => (
        <span key={`${v}-${i}`} style={{ background: '#ecfdf5', color: PRIMARY_DARK, padding: '6px 10px', borderRadius: 999 }}>
          {v}
          <button
            type="button"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            style={{ marginLeft: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: PRIMARY_DARK }}
            aria-label={`Remove ${v}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        placeholder={placeholder}
        onKeyDown={(e) => {
          const target = e.target as HTMLInputElement
          if (e.key === 'Enter' && target.value.trim()) {
            e.preventDefault()
            onChange([...values, target.value.trim()])
            target.value = ''
          }
        }}
        style={{ flex: 1, minWidth: 160, border: 'none', outline: 'none' }}
      />
    </div>
  )
}

export { PRIMARY }


