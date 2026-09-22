import { render, screen, fireEvent } from '@testing-library/react'
import Button from './index'

describe('Button', () => {
  it('renders its children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Go</Button>)
    fireEvent.click(screen.getByRole('button', { name: 'Go' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('applies the secondary variant class when requested', () => {
    render(<Button variant="secondary">Cancel</Button>)
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('bg-white')
  })
})
