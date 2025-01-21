import { cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'
import { TokenForgeAuthProvider } from '../../context/TokenForgeAuthProvider'

afterEach(() => {
  cleanup()
})

function renderWithProviders(ui: React.ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => (
      <TokenForgeAuthProvider>{children}</TokenForgeAuthProvider>
    ),
  })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
