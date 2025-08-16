/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, useCallback, useRef} from 'react'
import shuffle from 'lodash.shuffle'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import useStore from '../lib/store'
import {
  addRound,
  setOutputMode,
  setPhotoBatchSize,
  setTextModel,
  setVideoModel,
  reset
} from '../lib/actions'
import {isTouch, isIframe} from '../lib/consts'
import FeedItem from './FeedItem'
import Intro from './Intro'

export default function App() {
  const feed = useStore.use.feed()
  const outputMode = useStore.use.outputMode()
  const photoBatchSize = useStore.use.photoBatchSize()
  const textModel = useStore.use.textModel()
  const videoModel = useStore.use.videoModel()

  const [presets, setPresets] = useState([])
  const [showPresets, setShowPresets] = useState(false)
  const [inputImage, setInputImage] = useState(null)
  const [isDark, setIsDark] = useState(true)

  const inputRef = useRef(null)
  const imageInputRef = useRef(null)

  const isImageInputDisabled = outputMode === 'photo'

  const handleImageSet = async file => {
    if (file) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setInputImage(base64)
    }
  }

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode].presets)),
    [outputMode]
  )

  const onModifyPrompt = useCallback(prompt => {
    inputRef.current.value = prompt
    inputRef.current.focus()
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark)
  }, [isDark])

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  useEffect(() => {
    if (isTouch) {
      addEventListener('touchstart', () => {
        setShowPresets(false)
      })
    }
  }, [])

  useEffect(() => {
    if (!isIframe) {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [isDark])

  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header>
        <div>
          <h1>
            <p>Jenga</p>
            <p>Studio</p>
          </h1>
        </div>

        <div>
          <div className="toggle">
            <button
              className={c('button', {primary: outputMode === 'text'})}
              onClick={() => setOutputMode('text')}
            >
              <span className="icon">article</span> Text
            </button>
            <button
              className={c('button', {primary: outputMode === 'photo'})}
              onClick={() => setOutputMode('photo')}
            >
              <span className="icon">photo_camera</span> Photo
            </button>
            <button
              className={c('button', {primary: outputMode === 'video'})}
              onClick={() => setOutputMode('video')}
            >
              <span className="icon">videocam</span> Video
            </button>
          </div>
          <div className="label">Mode</div>
        </div>

        {outputMode === 'text' && (
          <div>
            <div className="selectWrapper">
              <select
                value={textModel}
                onChange={e => setTextModel(e.target.value)}
              >
                {models.text.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.version} {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="label">Model</div>
          </div>
        )}

        {outputMode === 'video' && (
          <div>
            <div className="selectWrapper">
              <select
                value={videoModel}
                onChange={e => setVideoModel(e.target.value)}
              >
                {models.video.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.version} {model.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="label">Model</div>
          </div>
        )}

        <div
          className={c('imageInput', {disabled: isImageInputDisabled})}
          onClick={() => !isImageInputDisabled && imageInputRef.current.click()}
          onDragOver={e => !isImageInputDisabled && e.preventDefault()}
          onDrop={e => {
            if (isImageInputDisabled) return
            e.preventDefault()
            handleImageSet(e.dataTransfer.files[0])
          }}
        >
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            onChange={e => handleImageSet(e.target.files[0])}
            disabled={isImageInputDisabled}
          />
          <div className="dropZone">
            {inputImage && <img src={inputImage} alt="User input" />}
            Drop image here
          </div>
          <div className="label">
            Input image (optional)
            {isImageInputDisabled && ' (not available for photo mode)'}
          </div>
        </div>

        <div
          className="selectorWrapper prompt"
          onMouseEnter={!isTouch && (() => setShowPresets(true))}
          onMouseLeave={!isTouch && (() => setShowPresets(false))}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowPresets(true)
                }
              : null
          }
        >
          <input
            className="promptInput"
            placeholder="Enter a prompt"
            onFocus={!isTouch && (() => setShowPresets(false))}
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRound(e.target.value, inputImage)
                e.target.blur()
              }
            }}
          />
          <div className={c('selector', {active: showPresets})}>
            <ul className="presets wrapped">
              <li>
                <button
                  onClick={() => {
                    addRound(
                      presets[Math.floor(Math.random() * presets.length)].prompt,
                      inputImage
                    )
                    setShowPresets(false)
                  }}
                  className="chip primary"
                >
                  <span className="icon">Ifl</span>
                  Random prompt
                </button>
              </li>
              {presets.map(({label, prompt}) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      addRound(prompt, inputImage)
                      setShowPresets(false)
                    }}
                    className="chip"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="label">Prompt</div>
        </div>

        {outputMode === 'photo' && (
          <div>
            <div className="rangeWrap">
              <div className="batchSize">
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={photoBatchSize}
                  onChange={e => setPhotoBatchSize(e.target.valueAsNumber)}
                />{' '}
                {photoBatchSize}
              </div>
            </div>
            <div className="label">Number of photos</div>
          </div>
        )}

        <div>
          <button
            className="circleButton resetButton"
            onClick={() => {
              reset()
              setInputImage(null)
              imageInputRef.current.value = ''
              inputRef.current.value = ''
            }}
          >
            <span className="icon">replay</span>
          </button>
          <div className="label">Reset</div>
        </div>

        {!isIframe && (
          <div>
            <button className="circleButton resetButton" onClick={toggleTheme}>
              <span className="icon">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="label">Theme</div>
          </div>
        )}
      </header>

      <main>
        {feed.length ? (
          <ul className="feed">
            {feed.map(round => (
              <FeedItem
                key={round.id}
                round={round}
                onModifyPrompt={onModifyPrompt}
              />
            ))}
          </ul>
        ) : (
          <Intro />
        )}
      </main>
    </div>
  )
}