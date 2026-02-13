export function normalizeText(text = '') {
  return String(text)
    .replace(/[.,;:!?()"'“”«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Helper for Multiple Choice direction-specific display
export function shouldShowTTSForMultipleChoice({ direction = 'en_to_hu', side = 'main' } = {}) {
  // Accept both 'en-to-hu' and 'en_to_hu'
  const norm = String(direction).replace(/-/g, '_')
  if (side === 'main') return norm === 'en_to_hu'
  if (side === 'option') return norm === 'hu_to_en'
  return false
}
