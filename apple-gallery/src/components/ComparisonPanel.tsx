import { useId, useState } from 'react'
import { current, legacyDevices, type Device } from '../data'
import { ChevronDown, MetricIcon } from './Icons'
import { Reveal } from './Reveal'

type Row = {
  key: string
  icon: 'chip' | 'battery' | 'camera' | 'display'
  describe: (from: Device) => { stat: string; label: string }
}

const pct = (a: number, b: number) => Math.round(((a - b) / b) * 100)

const rows: Row[] = [
  {
    key: 'chip',
    icon: 'chip',
    describe: (from) => ({
      stat: from.year >= 2024 ? 'Hasta 40% más rápido' : 'Hasta 2,5x más rápido',
      label: `Chip ${current.chip} frente al ${from.chip}.`,
    }),
  },
  {
    key: 'battery',
    icon: 'battery',
    describe: (from) => ({
      stat: `+${current.battery - from.battery} h`,
      label: `Hasta ${current.battery} h de video frente a ${from.battery} h.`,
    }),
  },
  {
    key: 'camera',
    icon: 'camera',
    describe: (from) =>
      from.zoom === current.zoom && from.camera === current.camera
        ? { stat: 'Ultra gran angular 48 MP', label: 'Ahora las tres cámaras son de 48 MP.' }
        : { stat: `${current.zoom}x vs ${from.zoom}x`, label: `Zoom óptico y sensor de ${current.camera} MP frente a ${from.camera} MP.` },
  },
  {
    key: 'display',
    icon: 'display',
    describe: (from) => ({
      stat: `+${pct(current.brightness, from.brightness)}% brillo`,
      label: `${current.brightness} nits de pico frente a ${from.brightness}.`,
    }),
  },
]

export function ComparisonPanel() {
  const selectId = useId()
  const [deviceId, setDeviceId] = useState(legacyDevices[1]?.id ?? '')
  const from = legacyDevices.find((d) => d.id === deviceId) ?? legacyDevices[0]!

  return (
    <section className="band band--obsidian" id="compare" aria-labelledby="compare-title">
      <div className="container">
        <Reveal className="compare">
          <div className="compare__header">
            <h2 id="compare-title" className="compare__title">¿Por qué cambiar ahora?</h2>
            <p className="compare__lede">Elige tu modelo actual y mira lo que ganas al pasar al One Pro.</p>
            <label htmlFor={selectId} className="sr-only">Tu dispositivo actual</label>
            <div className="device-select">
              <select id={selectId} value={deviceId} onChange={(e) => setDeviceId(e.target.value)}>
                {legacyDevices.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
              <span className="device-select__chevron"><ChevronDown /></span>
            </div>
          </div>

          <ul className="compare__grid" aria-live="polite">
            {rows.map((row) => {
              const { stat, label } = row.describe(from)
              return (
                <li key={row.key} className="tile tile--compact">
                  <div className="tile__visual"><MetricIcon icon={row.icon} /></div>
                  <p className="tile__stat">{stat}</p>
                  <p className="tile__label">{label}</p>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
