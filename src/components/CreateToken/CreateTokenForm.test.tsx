import { render, screen } from '../../test-utils'
import { CreateTokenForm } from './CreateTokenForm'
import '@testing-library/jest-dom'

describe('CreateTokenForm', () => {
  it('renders form fields', () => {
    render(<CreateTokenForm />)
    
    expect(screen.getByPlaceholderText('Nom du Token')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Symbole')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Supply Initial')).toBeInTheDocument()
  })
}) 