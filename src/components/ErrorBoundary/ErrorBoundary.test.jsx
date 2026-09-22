import { render, screen } from '@testing-library/react'
import ErrorBoundary from './index'

function Bomb() {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>safe content</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders a fallback message when a child throws', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    consoleError.mockRestore()
  })
})
