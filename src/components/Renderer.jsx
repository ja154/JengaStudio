/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {memo} from 'react'

function Renderer({mode, data}) {
  if (mode === 'text') {
    return <pre className="textRenderer">{data}</pre>
  }

  return (
    <div className={`renderer ${mode}Renderer`}>
      {mode === 'photo' ? (
        <img src={data} alt="Generated image" />
      ) : (
        <video src={data} controls autoPlay loop playsInline />
      )}
    </div>
  )
}

export default memo(Renderer)
