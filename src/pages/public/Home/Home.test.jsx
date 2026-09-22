import { render, screen, waitFor } from '@testing-library/react'
import * as homepageApi from '../../../api/homepageApi'
import Home from './index'

vi.mock('../../../api/homepageApi')

describe('Home', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows a loading state, then the fetched hero content', async () => {
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Explore Unlimited Trade Prospects Worldwide' },
      highlights: [],
    })

    render(<Home />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
    expect(screen.getByText('Explore Unlimited Trade Prospects Worldwide')).toBeInTheDocument()
  })

  it('shows an error message when the fetch fails', async () => {
    homepageApi.getHomepageContent.mockRejectedValue({ message: 'Network error', status: 0 })

    render(<Home />)
    await waitFor(() => expect(screen.getByText('Network error')).toBeInTheDocument())
  })
})
