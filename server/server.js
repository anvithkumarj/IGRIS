import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Buffer } from 'buffer'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js'
import { env } from 'node:process'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 10000; // fallback if PORT not set
app.listen(PORT, () => {
  console.log(`🚀 IGRIS AI SERVER ONLINE on port ${PORT}`);
});

// =========================
// PATHS
// =========================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const audioFolder = path.join(__dirname, 'audio')

if (!fs.existsSync(audioFolder)) {
  fs.mkdirSync(audioFolder, { recursive: true })
}

app.use('/audio', express.static(audioFolder))

const frontendFolder = path.join(__dirname, '..', 'dist')

app.use(express.static(frontendFolder))

app.use(cors())
app.use(express.json())

// ============================================================= Part - 2 

// =========================
// ENVIRONMENT CHECK
// =========================

console.log(
  env.GEMINI_API_KEY
    ? '✅ GEMINI API KEY LOADED'
    : '❌ GEMINI API KEY MISSING'
)

console.log(
  env.ELEVENLABS_API_KEY
    ? '✅ ELEVENLABS API KEY LOADED'
    : '❌ ELEVENLABS API KEY MISSING'
)

console.log(
  env.ELEVENLABS_VOICE_ID
    ? '✅ ELEVENLABS VOICE ID LOADED'
    : '❌ ELEVENLABS VOICE ID MISSING'
)

// =========================
// GEMINI
// =========================

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
})

const MODEL = 'gemini-3.6-flash'

// =========================
// ELEVENLABS
// =========================

const elevenlabs = new ElevenLabsClient({
  apiKey: env.ELEVENLABS_API_KEY,
})

//================================================================ part 3A

// =========================
// TEST ROUTE
// =========================

app.get('/', (req, res) => {
  res.json({
    message: 'IGRIS AI SERVER ONLINE',
    model: MODEL,
    gemini: !!env.GEMINI_API_KEY,
    elevenlabs: !!env.ELEVENLABS_API_KEY,
    voice: !!env.ELEVENLABS_VOICE_ID,
    audioFolder,
  })
})

// =========================
// ASK IGRIS
// =========================

app.post('/api/ask', async (req, res) => {
  const {
    question,
    name,
    language,
  } = req.body

  console.log('==============================')
  console.log('NEW REQUEST')
  console.log('QUESTION:', question)
  console.log('USER:', name)
  console.log('LANGUAGE:', language)

  if (!question) {
    return res.status(400).json({
      error: 'Question is required.',
    })
  }

  try {

    const prompt = `
You are IGRIS.

A futuristic AI assistant.

User Name:
${name || 'User'}

Preferred Language:
${language || 'English'}

Understand any language.

Always reply exactly like this.

ANSWER:
<A complete answer in English.>

SPEECH:
<Speak naturally in ${language || 'English'}>

Question:

${question}
`

    console.log('Sending to Gemini...')

    const result =
      await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
      })

    const text = result.text || ''

    console.log('Gemini replied.')

    const answerMatch =
      text.match(
        /ANSWER:\s*([\s\S]*?)(?=\s*SPEECH:)/i
      )

    const speechMatch =
      text.match(
        /SPEECH:\s*([\s\S]*)/i
      )

    const answer =
      answerMatch
        ? answerMatch[1].trim()
        : text.trim()

    const speech =
      speechMatch
        ? speechMatch[1].trim()
        : answer

    console.log('ANSWER:')
    console.log(answer)

    console.log('SPEECH:')
    console.log(speech)

    //==========================================================part - 3B

    // =========================
    // GENERATE IGRIS VOICE
    // =========================

    let audio = null

    try {

      console.log('Generating ElevenLabs Voice...')

      const audioStream =
        await elevenlabs.textToSpeech.convert(
          env.ELEVENLABS_VOICE_ID,
          {
            text: speech,

            model_id:
              'eleven_multilingual_v2',

            output_format:
              'mp3_44100_128',
          }
        )

      const chunks = []

      for await (const chunk of audioStream) {
        chunks.push(chunk)
      }

      const buffer =
        Buffer.concat(chunks)

      const filename =
        `igris-${Date.now()}.mp3`

      const filepath =
        path.join(audioFolder, filename)

      fs.writeFileSync(
        filepath,
        buffer
      )

      audio =
        `/audio/${filename}`

      console.log(
        'VOICE SAVED:',
        filename
      )

    } catch (voiceError) {

      console.error(
        'ELEVENLABS ERROR'
      )

      console.error(voiceError)

    }

    res.json({

      answer,

      speech,

      audio,

    })

  } catch (error) {

    console.error(
      'SERVER ERROR'
    )

    console.error(error)

    res.status(500).json({

      error:
        'IGRIS brain could not answer right now.',

    })

  }

})

app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(frontendFolder, 'index.html')
  )
})

//====================================================================part 4

// =========================
// START SERVER
// =========================

app.listen(PORT, () => {
  console.log('================================')
  console.log('🚀 IGRIS AI SERVER ONLINE')
  console.log(`🌐 http://localhost:${PORT}`)
  console.log(`🤖 MODEL : ${MODEL}`)
  console.log(`🎤 AUDIO : ${audioFolder}`)
  console.log('================================')
})



