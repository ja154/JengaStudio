/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI} from '@google/genai'
import pLimit from 'p-limit'

const ai = new GoogleGenAI({apiKey: process.env.API_KEY})
const limit = pLimit(9)

const generateText = async ({model, prompt, promptImage}) => {
  if (promptImage) {
    const mimeType = promptImage.match(/data:(.*);base64,/)?.[1] || 'image/png'
    const data = promptImage.split(',')[1]
    const imagePart = {inlineData: {mimeType, data}}
    const textPart = {text: prompt}
    const response = await ai.models.generateContent({
      model,
      contents: {parts: [imagePart, textPart]}
    })
    return response.text
  } else {
    const response = await ai.models.generateContent({
      model,
      contents: prompt
    })
    return response.text
  }
}

const generatePhoto = async ({model, prompt}) => {
  const response = await ai.models.generateImages({
    model,
    prompt,
    config: {
      numberOfImages: 1,
      outputMimeType: 'image/png'
    }
  })

  const base64ImageBytes = response.generatedImages[0].image.imageBytes
  return `data:image/png;base64,${base64ImageBytes}`
}

const generateVideo = async ({model, prompt, promptImage, onUpdate}) => {
  onUpdate('Sending video generation request...')

  const videoParams = {
    model,
    prompt,
    config: {numberOfVideos: 1}
  }

  if (promptImage) {
    const mimeType = promptImage.match(/data:(.*);base64,/)?.[1] || 'image/png'
    const data = promptImage.split(',')[1]
    videoParams.image = {
      imageBytes: data,
      mimeType
    }
  }

  let operation = await ai.models.generateVideos(videoParams)
  onUpdate('Video generation started. This may take a few minutes...')

  const checkInterval = 10000 // 10 seconds
  const progressMessages = [
    'Analyzing prompt...',
    'Allocating resources...',
    'Warming up the digital cameras...',
    'The scene is being set...',
    'Lights, camera, action!',
    'Rendering frames...',
    'Adding special effects...',
    'Finalizing the cut...',
    'Almost there, just polishing...'
  ]
  let messageIndex = 0

  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, checkInterval))
    onUpdate(progressMessages[messageIndex % progressMessages.length])
    messageIndex++
    operation = await ai.operations.getVideosOperation({operation})
  }

  if (operation.error) {
    throw new Error(operation.error.message || 'Video generation failed.')
  }

  onUpdate('Fetching generated video...')
  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri
  if (!downloadLink) {
    throw new Error('Could not retrieve video download link.')
  }

  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`)
  if (!response.ok) {
    throw new Error(`Failed to download video: ${response.statusText}`)
  }
  const videoBlob = await response.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(videoBlob)
  })
}

const doGeneration = async params => {
  const {outputMode} = params
  if (outputMode === 'text') {
    return generateText(params)
  } else if (outputMode === 'photo') {
    return generatePhoto(params)
  } else if (outputMode === 'video') {
    return generateVideo(params)
  }
}

export default params => limit(() => doGeneration(params))
