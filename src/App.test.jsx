import { render, screen, waitFor } from '@testing-library/react'
import * as homepageApi from './api/homepageApi'
import App from './App'

vi.mock('./api/homepageApi')

describe('App', () => {
  it('renders the Home page hero at the root path', async () => {
    homepageApi.getHomepageContent.mockResolvedValue({
      hero: { title: 'Gateway to Global Markets', subtitle: 'Sub' },
      highlights: [],
    })
    render(<App />)
    await waitFor(() => expect(screen.getByText('Gateway to Global Markets')).toBeInTheDocument())
  })
})
