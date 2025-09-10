import { type FormEvent, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Container, Field, Input, Heading, Subtext, Card } from '../ui'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      const from = (location.state as { from?: string })?.from || '/app'
      navigate(from, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container center>
      <Card style={{ width: '100%', maxWidth: 420 }}>
        <Heading>Welcome back</Heading>
        <Subtext>Log in to continue</Subtext>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </Field>
          {error && <Subtext color="error">{error}</Subtext>}
          <Button type="submit" disabled={loading}>{loading ? 'Logging in…' : 'Login'}</Button>
        </form>
        <Subtext style={{ marginTop: 12 }}>No account? <Link to="/register">Register</Link></Subtext>
      </Card>
    </Container>
  )
}


