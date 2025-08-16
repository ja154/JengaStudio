/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, memo} from 'react'
import c from 'clsx'
import models from '../lib/models'
import Renderer from './Renderer'

function ModelOutput({
  model,
  outputData,
  outputMode,
  isBusy,
  startTime,
  totalTime,
  gotError,
  statusMessage
}) {
  const [time, setTime] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [copied, setCopied] = useState(false)

  const isMedia = outputMode === 'photo' || outputMode === 'video'
  const modelInfo = models[outputMode].find(m => m.id === model)

  const copyOutput = () => {
    navigator.clipboard.writeText(outputData)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadOutput = async () => {
    setDownloading(true)
    try {
      const link = document.createElement('a')
      link.href = outputData
      const extension = outputMode === 'photo' ? 'png' : 'mp4'
      const filename = `generated-${outputMode}-${new Date().toISOString()}.${extension}`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (e) {
      console.error('Download failed', e)
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    let interval

    if (isBusy) {
      interval = setInterval(() => setTime(Date.now() - startTime), 10)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [startTime, isBusy])

  return (
    <div className="modelOutput">
      <div className="outputRendering">
        <div className="front">
          {gotError && (
            <div className="error">
              <p>
                <span className="icon">error</span>
              </p>
              <p>Response error</p>
            </div>
          )}

          {isBusy && (
            <div className="loader">
              <span className="icon">hourglass</span>
              {outputMode === 'video' && statusMessage && (
                <p className="statusMessage">{statusMessage}</p>
              )}
            </div>
          )}

          {outputData && <Renderer mode={outputMode} data={outputData} />}
        </div>
      </div>

      <div className="modelInfo">
        <div className="modelName">
          <div>
            {modelInfo.version} {modelInfo.name}
          </div>
          {(time || totalTime) && (
            <div className="timer">
              {((isBusy ? time : totalTime) / 1000).toFixed(2)}s
            </div>
          )}
        </div>

        <div className={c('outputActions', {active: outputData})}>
          {isMedia ? (
            <button
              className="iconButton"
              onClick={downloadOutput}
              disabled={downloading}
            >
              <span className="icon">
                {downloading ? 'progress_activity' : 'download'}
              </span>
              <span className="tooltip">
                {downloading ? 'Downloading...' : 'Download'}
              </span>
            </button>
          ) : (
            <button className="iconButton" onClick={copyOutput}>
              <span className="icon">{copied ? 'done' : 'content_copy'}</span>
              <span className="tooltip">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(ModelOutput)