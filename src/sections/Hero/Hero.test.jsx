import { render, screen } from '@testing-library/react'
import Hero from './index'

describe('Hero', () => {
  it('renders the title and subtitle over the video background', () => {
    render(<Hero title="Gateway to Global Markets: Exporters Guide" subtitle="Explore Unlimited Trade Prospects Worldwide" />)
    expect(screen.getByRole('heading', { name: 'Gateway to Global Markets: Exporters Guide' })).toBeInTheDocument()
    expect(screen.getByText('Explore Unlimited Trade Prospects Worldwide')).toBeInTheDocument()
  })
})
