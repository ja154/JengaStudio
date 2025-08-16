/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {outputWidth, outputHeight} from './consts'

const f = s =>
  s
    .replaceAll(/([^\n{])\n([^\n}\s+])/g, '$1 $2')
    .replaceAll(/\n{3,}/g, '\n\n')
    .trim()

export default {
  text: {
    name: 'Text',
    emoji: '📝',
    syntax: 'text',
    systemInstruction: f(
      `You are an expert at creative writing and helpful responses.`
    ),
    getTitle: s => s.split('\n')[0].slice(0, 50),
    presets: [
      {
        label: 'write a poem',
        prompt: 'Write a short poem about the changing of seasons.'
      },
      {
        label: 'explain a concept',
        prompt: 'Explain quantum computing in simple terms.'
      },
      {
        label: 'code a button',
        prompt: 'Write HTML and CSS for a modern-looking button.'
      },
      {
        label: 'story starter',
        prompt:
          'Start a story that begins with the line: "The old bookstore smelled of dust and magic."'
      },
      {
        label: 'brainstorm names',
        prompt: 'Brainstorm five catchy names for a new coffee shop.'
      }
    ]
  },
  photo: {
    name: 'Photo',
    emoji: '🖼️',
    syntax: 'image',
    systemInstruction: f(`\
You are an expert at turning text prompts into professional, creative photos.
When given a prompt, you will use your creativity to create a
${outputWidth}x${outputHeight} image that perfectly satisfies the prompt.`),
    getTitle: s => s,
    presets: [
      {
        label: ' futuristic city',
        prompt:
          'a sprawling futuristic city at dusk, with flying vehicles and holographic ads, cinematic lighting'
      },
      {
        label: 'enchanted forest',
        prompt:
          'an enchanted forest with glowing mushrooms and ancient trees, a mystical creature peeking from behind a tree'
      },
      {
        label: 'steampunk explorer',
        prompt:
          'a detailed portrait of a steampunk explorer with brass goggles and intricate gear, in a workshop filled with inventions'
      },
      {
        label: 'surreal dreamscape',
        prompt:
          'a surreal dreamscape with floating islands and upside-down waterfalls, pastel colors'
      },
      {
        label: 'gourmet meal',
        prompt:
          'a close-up shot of a gourmet meal on a rustic wooden table, shallow depth of field, food photography'
      },
      {
        label: 'cyberpunk alley',
        prompt:
          'a neon-lit alley in a cyberpunk city, rain reflecting the glowing signs, a mysterious figure in the distance'
      },
      {
        label: 'vintage robot',
        prompt: 'a friendly vintage robot from the 1950s, standing in a suburban home'
      },
      {
        label: 'underwater kingdom',
        prompt: 'a majestic underwater kingdom with bioluminescent coral and diverse sea life'
      }
    ]
  },
  video: {
    name: 'Video',
    emoji: '🎬',
    syntax: 'video',
    systemInstruction: f(`\
You are an expert at turning text prompts into professional, creative videos.
When given a prompt, you will use your creativity to create a video that
perfectly satisfies the prompt.`),
    getTitle: s => s,
    presets: [
      {
        label: 'drone shot of mountains',
        prompt: 'an aerial drone shot flying over a majestic mountain range at sunrise'
      },
      {
        label: 'time-lapse of a flower',
        prompt: 'a time-lapse video of a flower blooming, from bud to full blossom'
      },
      {
        label: 'cat playing piano',
        prompt: 'a cute, fluffy cat enthusiastically playing a tiny piano'
      },
      {
        label: 'busy city intersection',
        prompt: 'a time-lapse of a busy city intersection, with light trails from traffic at night'
      },
      {
        label: 'astronaut on Mars',
        prompt: 'an astronaut planting a flag on the surface of Mars, with Earth visible in the sky'
      },
      {
        label: 'calm beach waves',
        prompt: 'gentle waves washing over a sandy beach, shot from a low angle'
      },
      {
        label: 'cooking montage',
        prompt: 'a fast-paced montage of a chef preparing a complex dish'
      },
      {
        label: 'animated abstract shapes',
        prompt: 'a looping animation of colorful abstract shapes morphing and flowing smoothly'
      }
    ]
  }
}