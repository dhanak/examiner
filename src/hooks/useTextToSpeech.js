import { useEffect, useRef, useState, useCallback } from 'react'

export default function useTextToSpeech({ langPreference = 'en-GB' } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const synthRef = useRef(typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null)
  const voicesRef = useRef([])
  const utterRef = useRef(null)

  useEffect(() => {
    const synth = synthRef.current
    if (!synth) return

    const setVoices = () => {
      try {
        voicesRef.current = synth.getVoices() || []
      } catch (e) {
        voicesRef.current = []
      }
    }

    setVoices()
    synth.addEventListener && synth.addEventListener('voiceschanged', setVoices)
    return () => {
      try {
        synth.removeEventListener && synth.removeEventListener('voiceschanged', setVoices)
      } catch (e) {}
    }
  }, [])

  const chooseVoice = useCallback(
    (lang) => {
      const voices = voicesRef.current || []
      if (!voices.length) return null
      // Prefer exact langPreference (e.g. en-GB)
      const pref = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith(langPreference.toLowerCase()))
      if (pref) return pref
      // Fallback to any English voice
      const en = voices.find((v) => v.lang && v.lang.toLowerCase().startsWith('en'))
      return en || voices[0]
    },
    [langPreference]
  )

  const speak = useCallback(
    (text, { lang = langPreference } = {}) => {
      if (!synthRef.current) return Promise.reject(new Error('TTS not supported'))
      if (!text) return Promise.resolve()

      const normalized = String(text).replace(/\s+/g, ' ').trim()

      try {
        if (synthRef.current.speaking) {
          synthRef.current.cancel()
        }
      } catch (e) {
        // ignore
      }

      const utter = new SpeechSynthesisUtterance(normalized)
      const voice = chooseVoice(lang)
      if (voice) utter.voice = voice
      utter.lang = lang
      utter.onstart = () => setIsSpeaking(true)
      utter.onend = () => setIsSpeaking(false)
      utter.onerror = () => setIsSpeaking(false)
      utterRef.current = utter

      try {
        synthRef.current.speak(utter)
      } catch (e) {
        // Some browsers may throw if speak is not available
        setIsSpeaking(false)
        return Promise.reject(e)
      }

      return Promise.resolve()
    },
    [chooseVoice, langPreference]
  )

  const cancel = useCallback(() => {
    if (!synthRef.current) return
    try {
      synthRef.current.cancel()
    } catch (e) {}
    setIsSpeaking(false)
  }, [])

  return { speak, cancel, isSpeaking }
}
