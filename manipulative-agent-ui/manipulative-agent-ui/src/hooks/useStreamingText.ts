import { useState, useEffect, useRef, useCallback } from 'react'

interface UseStreamingTextOptions {
  text: string
  enabled: boolean
  charDelay?: number
  punctuationDelay?: number
  onComplete?: () => void
}

export function useStreamingText({
  text,
  enabled,
  charDelay = 18,
  punctuationDelay = 120,
  onComplete,
}: UseStreamingTextOptions) {
  const [displayedText, setDisplayedText] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const indexRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    indexRef.current = 0
    setDisplayedText('')
    setIsStreaming(false)
  }, [])

  useEffect(() => {
    if (!enabled || !text) {
      reset()
      return
    }

    setIsStreaming(true)
    indexRef.current = 0
    setDisplayedText('')

    function tick() {
      if (indexRef.current >= text.length) {
        setIsStreaming(false)
        onCompleteRef.current?.()
        return
      }

      const char = text[indexRef.current]
      indexRef.current++
      setDisplayedText(text.slice(0, indexRef.current))

      // Variable delay based on character
      let delay = charDelay
      if (char === '.' || char === '!' || char === '?') delay = punctuationDelay
      else if (char === ',' || char === ';' || char === ':') delay = punctuationDelay * 0.6
      else if (char === '\n') delay = punctuationDelay * 0.8

      // Batch multiple characters for speed (3 chars at a time for non-punctuation)
      if (char !== '.' && char !== '!' && char !== '?' && char !== '\n' && char !== ',' && indexRef.current < text.length) {
        const batchSize = 2
        for (let i = 0; i < batchSize && indexRef.current < text.length; i++) {
          const nextChar = text[indexRef.current]
          if (nextChar === '.' || nextChar === '!' || nextChar === '?' || nextChar === '\n') break
          indexRef.current++
        }
        setDisplayedText(text.slice(0, indexRef.current))
      }

      timerRef.current = setTimeout(tick, delay)
    }

    timerRef.current = setTimeout(tick, 300) // initial delay before starting

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [text, enabled, charDelay, punctuationDelay, reset])

  return { displayedText, isStreaming, reset }
}
