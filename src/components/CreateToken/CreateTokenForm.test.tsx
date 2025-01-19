import { render, screen } from '../../test-utils'
import { CreateTokenForm } from './CreateTokenForm'
import '@testing-library/jest-dom'

describe('CreateTokenForm', () => {
  it('renders form fields', () => {
    render(<CreateTokenForm />)
    
    // Vérifier la présence des labels plutôt que les placeholders
    expect(screen.getByText('Nom du Token')).toBeInTheDocument()
    expect(screen.getByText('Symbole')).toBeInTheDocument()
    expect(screen.getByText('Supply Initial')).toBeInTheDocument()
    
    // Vérifier la présence des champs de texte
    expect(screen.getByRole('textbox', { name: 'Nom du Token' })).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Symbole' })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: 'Supply Initial' })).toBeInTheDocument()
  })
})