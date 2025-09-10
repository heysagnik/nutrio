import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Container, Heading, Subtext } from '../ui'

export function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    // Optional: if already logged in, go to app
    if (isAuthenticated) navigate('/app', { replace: true })
  }, [isAuthenticated, navigate])

  return (
    <Container center>
      <Heading>Nutrio</Heading>
      <Subtext>Eat smarter. Live better.</Subtext>
      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <Button onClick={() => navigate('/app')}>Open App</Button>
        <Button variant="ghost" onClick={() => navigate('/login')}>Login</Button>
      </div>
    </Container>
  )
}


