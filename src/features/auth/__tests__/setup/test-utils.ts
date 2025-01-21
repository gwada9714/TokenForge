import { cleanup, render } from '@testing-library/react'
import { afterEach } from 'vitest'
import { TokenForgeAuthProvider as AuthProvider } from '../../context/TokenForgeAuthProvider'
import { FC, PropsWithChildren, ReactElement } from 'react'

afterEach(() => {
  cleanup()
})

const Wrapper: FC<PropsWithChildren> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
)

function renderWithProviders(ui: ReactElement) {
  return render(ui, {
    wrapper: Wrapper
  })
}

export * from '@testing-library/react'
export { renderWithProviders as render }
