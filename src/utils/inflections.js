import { useState, useEffect } from 'react'

// Simple hook to load precomputed inflections for German (if available in public/data)
// Returns null if not available or for non-German languages.
const cache = {}

export default function useInflections(language) {
  const [data, setData] = useState(cache[language] || null)

  useEffect(() => {
    let mounted = true
    async function load() {
      if (language !== 'de') {
        if (mounted) setData(null)
        return
      }

      if (cache[language]) {
        if (mounted) setData(cache[language])
        return
      }

      const base = import.meta.env.BASE_URL || '/'
      const stripLeadingSlash = (p) => p.replace(/^\/+/, '')
      const candidates = [
        `${base}${stripLeadingSlash('data/vocabulary-de-inflections.json')}`,
        `${base}${stripLeadingSlash('vocabulary-de-inflections.json')}`,
        `${base}${stripLeadingSlash('vocab_de_inflections.json')}`,
        `${base}${stripLeadingSlash('data/vocab_de_inflections.json')}`
      ]

      let loaded = null
      for (const url of candidates) {
        try {
          const res = await fetch(url)
          if (res.ok) {
            loaded = await res.json()
            break
          }
        } catch {
          // ignore and try next
        }
      }

      cache[language] = loaded
      if (mounted) setData(loaded)
    }

    load()
    return () => { mounted = false }
  }, [language])

  return data
}
