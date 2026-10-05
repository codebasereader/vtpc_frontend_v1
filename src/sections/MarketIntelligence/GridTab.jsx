import { useMemo, useState } from 'react'
import { exporterCorner as t } from '../../language/exporterCorner'
import { formatShare, formatUsd, percentChange } from './format'
import { gridData } from './derive'
import { SegmentedControl, TabIntro } from './ui'

const mi = t.marketIntelligence
const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })

function formatCell(value) {
  if (value === null || value === undefined) return mi.grid.empty.en
  if (value >= 100) return grouped.format(value)
  if (value >= 1) return value.toFixed(1)
  if (value > 0) return value.toFixed(2)
  return '0'
}

const isNumber = (value) => typeof value === 'number' && Number.isFinite(value)

/** The number a cell displays: US$ million, or the state's percentage of India's sector total. */
function metricOf(figure, india, mode) {
  if (!figure || !isNumber(figure.current)) return null
  if (mode === 'value') return figure.current
  return india && isNumber(india.current) && india.current > 0 ? (figure.current / india.current) * 100 : null
}

function cellTitle(sector, state, figure, mode, india, previousLabel) {
  const parts = [`${state} · ${sector}: ${formatUsd(figure.current)}`]
  if (mode === 'share' && india?.current) parts.push(`${formatShare((figure.current / india.current) * 100)}% of India`)
  const change = percentChange(figure.previous, figure.current)
  if (change !== null) parts.push(`${change >= 0 ? '+' : ''}${change.toFixed(1)}% vs ${previousLabel}`)
  return parts.join(' — ')
}

function GridRow({ label, row, states, mode, previousLabel, showIndia, isBold, language }) {
  const metrics = states.map((state) => metricOf(row.cells[state], row.india, mode))
  const max = Math.max(...metrics.filter(isNumber), 0)
  const leaderIndex = max > 0 ? metrics.indexOf(max) : -1

  return (
    <tr className="border-t border-brand-divider">
      <th
        scope="row"
        className={`sticky left-0 z-10 min-w-48 bg-white px-3 py-2.5 text-left text-sm shadow-[1px_0_0_#e7dbdb] ${
          isBold ? 'font-bold text-brand-navy-dark' : 'font-medium text-brand-dark'
        }`}
      >
        {label}
      </th>
      {states.map((state, index) => {
        const metric = metrics[index]
        const figure = row.cells[state]
        const intensity = max > 0 && isNumber(metric) ? metric / max : 0
        const rgb = state === 'Karnataka' ? '200,55,68' : '35,76,134'
        const isLeader = index === leaderIndex
        return (
          <td
            key={state}
            title={figure && isNumber(figure.current) ? cellTitle(label, state, figure, mode, row.india, previousLabel) : undefined}
            style={{ backgroundColor: `rgba(${rgb},${(0.04 + intensity * 0.26).toFixed(3)})` }}
            className={`px-3 py-2.5 text-right text-sm tabular-nums ${
              isLeader ? 'font-bold text-brand-navy-dark ring-1 ring-brand-navy/50 ring-inset' : 'text-gray-700'
            }`}
          >
            {isNumber(metric) ? (mode === 'share' ? `${formatShare(metric)}%` : formatCell(metric)) : mi.grid.empty[language]}
          </td>
        )
      })}
      {showIndia && (
        <td className="bg-brand-page px-3 py-2.5 text-right text-sm font-semibold text-brand-dark tabular-nums">
          {isNumber(row.india?.current) ? formatCell(row.india.current) : mi.grid.empty[language]}
        </td>
      )}
    </tr>
  )
}

export default function GridTab({ release, language }) {
  const [mode, setMode] = useState('value')
  const grid = useMemo(() => gridData(release), [release])
  const showIndia = mode === 'value'

  return (
    <div>
      <TabIntro title={mi.grid.title[language]} hint={mi.grid.hint[language]} />

      <div className="mt-4">
        <SegmentedControl
          label={mi.grid.viewLabel[language]}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'value', label: mi.grid.viewValue[language] },
            { value: 'share', label: mi.grid.viewShare[language] },
          ]}
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-brand-divider">
        <table className="w-full border-collapse">
          <caption className="sr-only">{mi.grid.title[language]}</caption>
          <thead>
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-brand-navy-dark px-3 py-3 text-left text-xs font-bold tracking-wide text-white uppercase">
                {mi.grid.sector[language]}
              </th>
              {grid.states.map((state) => (
                <th
                  key={state}
                  scope="col"
                  className={`px-3 py-3 text-right text-xs font-bold tracking-wide whitespace-nowrap text-white uppercase ${
                    state === 'Karnataka' ? 'bg-brand-primary' : 'bg-brand-navy'
                  }`}
                >
                  {state}
                </th>
              ))}
              {showIndia && (
                <th scope="col" className="bg-brand-navy-dark px-3 py-3 text-right text-xs font-bold tracking-wide whitespace-nowrap text-white uppercase">
                  {mi.grid.india[language]}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {grid.goods.map((row) => (
              <GridRow key={row.sector} label={row.sector} row={row} states={grid.states} mode={mode} previousLabel={release.previousLabel} showIndia={showIndia} language={language} />
            ))}
            <GridRow label={mi.grid.goodsTotal[language]} row={grid.totals} states={grid.states} mode={mode} previousLabel={release.previousLabel} showIndia={showIndia} isBold language={language} />
          </tbody>
          {grid.services && (
            <tbody className="border-t-4 border-brand-divider">
              <GridRow label={mi.grid.servicesRow[language]} row={grid.services} states={grid.states} mode={mode} previousLabel={release.previousLabel} showIndia={showIndia} language={language} />
            </tbody>
          )}
        </table>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        {mode === 'value' ? `${mi.grid.viewValue[language]}.` : ''} {mi.states.servicesHint[language]}
      </p>
    </div>
  )
}
