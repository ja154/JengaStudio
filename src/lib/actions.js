/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import useStore from './store'
import modes from './modes'
import llmGen from './llm'
import models from './models'

const get = useStore.getState
const set = useStore.setState

export const init = () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true
  })
}

const newOutput = (modelId, mode) => ({
  model: modelId,
  id: crypto.randomUUID(),
  startTime: Date.now(),
  outputData: null,
  isBusy: true,
  gotError: false,
  outputMode: mode,
  statusMessage: mode === 'video' ? 'Initializing...' : null
})

export const addRound = (prompt, promptImage) => {
  scrollTo({top: 0, left: 0, behavior: 'smooth'})

  const {outputMode, photoBatchSize, textModel, videoModel} = get()

  if (!prompt) {
    return
  }

  const modelId =
    outputMode === 'text'
      ? textModel
      : outputMode === 'photo'
      ? models.photo[0].id
      : videoModel

  const newRound = {
    prompt,
    systemInstruction: modes[outputMode].systemInstruction,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    outputMode,
    outputs:
      outputMode === 'photo'
        ? new Array(photoBatchSize)
            .fill(null)
            .map(() => newOutput(models.photo[0].id, 'photo'))
        : [newOutput(modelId, outputMode)]
  }

  newRound.outputs.forEach(async (output, i) => {
    let res

    const modelInfo = models[output.outputMode].find(m => m.id === output.model)
    const modelString = modelInfo.modelString

    try {
      res = await llmGen({
        model: modelString,
        prompt,
        promptImage: outputMode === 'photo' ? null : promptImage,
        outputMode,
        onUpdate: statusMessage => {
          set(state => {
            const round = state.feed.find(r => r.id === newRound.id)
            if (round && round.outputs[i]) {
              round.outputs[i].statusMessage = statusMessage
            }
          })
        }
      })
    } catch (e) {
      console.error(e)
      set(state => {
        const round = state.feed.find(r => r.id === newRound.id)
        if (!round) {
          return
        }
        round.outputs[i] = {
          ...round.outputs[i],
          isBusy: false,
          gotError: true,
          totalTime: Date.now() - output.startTime
        }
      })
      return
    }

    set(state => {
      const round = state.feed.find(r => r.id === newRound.id)

      if (!round) {
        return
      }

      round.outputs[i] = {
        ...round.outputs[i],
        outputData: res,
        isBusy: false,
        totalTime: Date.now() - output.startTime
      }
    })
  })

  set(state => {
    state.feed.unshift(newRound)
  })
}

export const setOutputMode = mode =>
  set(state => {
    state.outputMode = mode
  })

export const setPhotoBatchSize = size =>
  set(state => {
    state.photoBatchSize = size
  })

export const setTextModel = modelId =>
  set(state => {
    state.textModel = modelId
  })

export const setVideoModel = modelId =>
  set(state => {
    state.videoModel = modelId
  })

export const removeRound = id =>
  set(state => {
    state.feed = state.feed.filter(round => round.id !== id)
  })

export const reset = () => {
  set(state => {
    state.feed = []
  })
}

init()