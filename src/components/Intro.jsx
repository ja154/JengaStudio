/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {addRound, setOutputMode} from '../lib/actions'

export default function Intro() {
  const [presets] = useState(
    Object.fromEntries(
      Object.entries(modes).map(([key, mode]) => [
        key,
        shuffle(mode.presets.slice(0, 50))
      ])
    )
  )

  return (
    <section className="intro">
      <h2>👋 Welcome to JengaStudio</h2>
      <p>
        Your all-in-one creative suite. Generate professional text, photos, and
        videos from a simple prompt. You can also provide an image as input to
        guide the generation. Try a preset below to get started.
      </p>

      {Object.entries(modes).map(([key, mode]) => (
        <div key={key}>
          <h3>
            {mode.emoji} {mode.name}
          </h3>

          <div className="selector presetList">
            <ul className="presets wrapped">
              {presets[key].map(({label, prompt}) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      setOutputMode(key)
                      addRound(prompt)
                    }}
                    className="chip"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </section>
  )
}