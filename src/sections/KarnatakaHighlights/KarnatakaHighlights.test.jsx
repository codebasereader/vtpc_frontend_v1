import { render, screen } from '@testing-library/react'
import KarnatakaHighlights from './index'

const HIGHLIGHTS = [
  { title: 'Diverse Economy', description: "Karnataka's economy spans agriculture, industry, and services." },
  { title: 'Innovation Hub', description: "Home to India's leading technology and biotech clusters." },
]

describe('KarnatakaHighlights', () => {
  it('renders a card per highlight', () => {
    render(<KarnatakaHighlights highlights={HIGHLIGHTS} />)
    expect(screen.getByRole('heading', { name: 'Diverse Economy' })).toBeInTheDocument()
    expect(screen.getByText("Karnataka's economy spans agriculture, industry, and services.")).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Innovation Hub' })).toBeInTheDocument()
  })

  it('renders nothing when there are no highlights', () => {
    const { container } = render(<KarnatakaHighlights highlights={[]} />)
    expect(container).toBeEmptyDOMElement()
  })
})
