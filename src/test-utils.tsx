import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'

const AllProviders = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ChakraProvider>
)

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => ({
  user: userEvent.setup(),
  ...render(ui, { wrapper: AllProviders, ...options })
})

export * from '@testing-library/react'
export { customRender as render } 