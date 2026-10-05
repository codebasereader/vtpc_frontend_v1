// Districts are a fixed list of names (used by the warehouse and taluk pickers).
// Their export figures come from the Market Data releases — see marketIntelligenceApi.js.
import axiosClient from './axiosClient'

export function getDistricts() {
  return axiosClient.get('/districts').then((res) => res.data)
}
