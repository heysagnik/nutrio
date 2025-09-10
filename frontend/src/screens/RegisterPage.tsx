import { type FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Container, Field, Input, Select, Checkbox, Heading, Subtext, Card, TagInput } from '../ui'

type RegisterPayload = {
  email: string
  password: string
  name: string
  age: number
  gender: 'male' | 'female' | 'other'
  height: number
  weight: number
  location: string
  activity_level: 'low' | 'moderate' | 'high'
  occupation: string
  sleep_duration: number
  stress_level: 'low' | 'medium' | 'high'
  medical_conditions: string[]
  allergies: string[]
  dietary_restrictions: string[]
  medications: string[]
  health_goal: 'weight_loss' | 'muscle_gain' | 'maintenance'
  target_weight: number
  preferred_cuisines: string[]
  cooking_skill: 'beginner' | 'intermediate' | 'advanced'
  dietary_dislikes: string[]
  consent_given: boolean
}

const initialState: RegisterPayload = {
  email: '',
  password: '',
  name: '',
  age: 0,
  gender: 'other',
  height: 0,
  weight: 0,
  location: '',
  activity_level: 'moderate',
  occupation: '',
  sleep_duration: 7,
  stress_level: 'medium',
  medical_conditions: [],
  allergies: [],
  dietary_restrictions: [],
  medications: [],
  health_goal: 'weight_loss',
  target_weight: 0,
  preferred_cuisines: [],
  cooking_skill: 'intermediate',
  dietary_dislikes: [],
  consent_given: false,
}

type Step = 0 | 1 | 2 | 3

export function RegisterPage() {
  const [form, setForm] = useState<RegisterPayload>(initialState)
  const [step, setStep] = useState<Step>(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const nextDisabled = useMemo(() => {
    if (step === 0) return !(form.email && form.password && form.name)
    if (step === 1) return !(form.age && form.height && form.weight)
    if (step === 2) return !(form.health_goal)
    if (step === 3) return !form.consent_given
    return false
  }, [step, form])

  const update = <K extends keyof RegisterPayload>(key: K, value: RegisterPayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (step < 3) {
      setStep((s) => (s + 1) as Step)
      return
    }
    setLoading(true)
    setError(null)
    try {
      await register(form as unknown as Record<string, unknown>)
      navigate('/app', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container center>
      <Card style={{ width: '100%', maxWidth: 720 }}>
        <Heading>Create your account</Heading>
        <Subtext>Step {step + 1} of 4</Subtext>
        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 16 }}>
          {step === 0 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Email"><Input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required /></Field>
              <Field label="Password"><Input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required /></Field>
              <Field label="Name"><Input value={form.name} onChange={(e) => update('name', e.target.value)} required /></Field>
              <Field label="Location"><Input value={form.location} onChange={(e) => update('location', e.target.value)} /></Field>
            </div>
          )}
          {step === 1 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
                <Field label="Age"><Input type="number" value={form.age || ''} onChange={(e) => update('age', Number(e.target.value))} required /></Field>
                <Field label="Gender"><Select value={form.gender} onChange={(e) => update('gender', e.target.value as RegisterPayload['gender'])} options={[{label:'Male', value:'male'},{label:'Female', value:'female'},{label:'Other', value:'other'}]} /></Field>
                <Field label="Height (cm)"><Input type="number" value={form.height || ''} onChange={(e) => update('height', Number(e.target.value))} required /></Field>
                <Field label="Weight (kg)"><Input type="number" value={form.weight || ''} onChange={(e) => update('weight', Number(e.target.value))} required /></Field>
              </div>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <Field label="Activity Level"><Select value={form.activity_level} onChange={(e) => update('activity_level', e.target.value as RegisterPayload['activity_level'])} options={[{label:'Low', value:'low'},{label:'Moderate', value:'moderate'},{label:'High', value:'high'}]} /></Field>
                <Field label="Occupation"><Input value={form.occupation} onChange={(e) => update('occupation', e.target.value)} /></Field>
                <Field label="Sleep (hours)"><Input type="number" value={form.sleep_duration || ''} onChange={(e) => update('sleep_duration', Number(e.target.value))} /></Field>
                <Field label="Stress Level"><Select value={form.stress_level} onChange={(e) => update('stress_level', e.target.value as RegisterPayload['stress_level'])} options={[{label:'Low', value:'low'},{label:'Medium', value:'medium'},{label:'High', value:'high'}]} /></Field>
              </div>
            </div>
          )}
          {step === 2 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <Field label="Medical Conditions"><TagInput values={form.medical_conditions} onChange={(v) => update('medical_conditions', v)} placeholder="e.g., none, diabetes" /></Field>
              <Field label="Allergies"><TagInput values={form.allergies} onChange={(v) => update('allergies', v)} placeholder="e.g., peanut" /></Field>
              <Field label="Dietary Restrictions"><TagInput values={form.dietary_restrictions} onChange={(v) => update('dietary_restrictions', v)} placeholder="e.g., vegetarian, vegan" /></Field>
              <Field label="Medications"><TagInput values={form.medications} onChange={(v) => update('medications', v)} placeholder="Add medication and press Enter" /></Field>
              <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
                <Field label="Health Goal"><Select value={form.health_goal} onChange={(e) => update('health_goal', e.target.value as RegisterPayload['health_goal'])} options={[{label:'Weight loss', value:'weight_loss'},{label:'Muscle gain', value:'muscle_gain'},{label:'Maintenance', value:'maintenance'}]} /></Field>
                <Field label="Target Weight (kg)"><Input type="number" value={form.target_weight || ''} onChange={(e) => update('target_weight', Number(e.target.value))} /></Field>
                <Field label="Cooking Skill"><Select value={form.cooking_skill} onChange={(e) => update('cooking_skill', e.target.value as RegisterPayload['cooking_skill'])} options={[{label:'Beginner', value:'beginner'},{label:'Intermediate', value:'intermediate'},{label:'Advanced', value:'advanced'}]} /></Field>
              </div>
              <Field label="Preferred Cuisines"><TagInput values={form.preferred_cuisines} onChange={(v) => update('preferred_cuisines', v)} placeholder="e.g., italian, mexican" /></Field>
              <Field label="Dietary Dislikes"><TagInput values={form.dietary_dislikes} onChange={(v) => update('dietary_dislikes', v)} placeholder="e.g., broccoli" /></Field>
            </div>
          )}
          {step === 3 && (
            <div style={{ display: 'grid', gap: 12 }}>
              <Checkbox checked={form.consent_given} onChange={(e) => update('consent_given', e.target.checked)}>
                I agree to the Terms and Privacy Policy
              </Checkbox>
            </div>
          )}
          {error && <Subtext color="error">{error}</Subtext>}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between', marginTop: 8 }}>
            <Button type="button" variant="ghost" onClick={() => setStep((s) => (s > 0 ? ((s - 1) as Step) : s))} disabled={step === 0}>Back</Button>
            <Button type="submit" disabled={loading || nextDisabled}>{loading ? 'Submitting…' : step < 3 ? 'Next' : 'Create Account'}</Button>
          </div>
        </form>
      </Card>
    </Container>
  )
}


