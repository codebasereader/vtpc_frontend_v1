import axiosClient from './axiosClient'
import { API_BASE_URL } from '../config/config'

describe('axiosClient', () => {
  it('is configured with the base URL from config', () => {
    expect(axiosClient.defaults.baseURL).toBe(API_BASE_URL)
  })

  it('sends credentials with every request', () => {
    expect(axiosClient.defaults.withCredentials).toBe(true)
  })

  it('normalizes a rejected response into { message, status }', async () => {
    const handlers = axiosClient.interceptors.response.handlers
    const onRejected = handlers[0].rejected
    const fakeError = {
      response: { status: 404, data: { message: 'Not found' } },
    }
    await expect(onRejected(fakeError)).rejects.toEqual({
      message: 'Not found',
      status: 404,
    })
  })

  it('falls back to a generic message when the server sends none', async () => {
    const handlers = axiosClient.interceptors.response.handlers
    const onRejected = handlers[0].rejected
    const fakeError = { response: { status: 500, data: {} } }
    await expect(onRejected(fakeError)).rejects.toEqual({
      message: 'Something went wrong. Please try again.',
      status: 500,
    })
  })
})
