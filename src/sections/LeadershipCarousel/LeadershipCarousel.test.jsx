import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as leadersApi from '../../api/leadersApi'
import LeadershipCarousel from './index'

vi.mock('../../api/leadersApi')

const LEADERS = [
  { id: '1', name: 'Shri Siddaramaiah', designation: { en: "Hon'ble Chief Minister of Karnataka", kn: '' }, photo: '', order: 1 },
  { id: '2', name: 'Shri D.K. Shivakumar', designation: { en: "Hon'ble Deputy Chief Minister of Karnataka", kn: '' }, photo: '', order: 2 },
]

describe('LeadershipCarousel', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('shows the first leader by default, then advances on Next', async () => {
    leadersApi.getLeaders.mockResolvedValue(LEADERS)
    render(<LeadershipCarousel />)

    await waitFor(() => expect(screen.getByText('Shri Siddaramaiah')).toBeInTheDocument())
    expect(screen.getByText("Hon'ble Chief Minister of Karnataka")).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /next/i }))
    expect(screen.getByText('Shri D.K. Shivakumar')).toBeInTheDocument()
  })

  it('renders nothing when there are no leaders', async () => {
    leadersApi.getLeaders.mockResolvedValue([])
    const { container } = render(<LeadershipCarousel />)
    await waitFor(() => expect(leadersApi.getLeaders).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing on fetch failure (non-critical section, fails quietly)', async () => {
    leadersApi.getLeaders.mockRejectedValue({ message: 'Network error', status: 0 })
    const { container } = render(<LeadershipCarousel />)
    await waitFor(() => expect(leadersApi.getLeaders).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })
})
