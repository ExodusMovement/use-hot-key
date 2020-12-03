const { useEffect, useCallback, useMemo } = require('react')

const ALL_MODIFIERS = ['shift', 'alt', 'ctrl', 'meta']

const isMacOS = (() => {
  if (typeof navigator !== 'undefined')
    return /^Mac/.test(navigator.platform)
  if (typeof process !== 'undefined')
    return process.platform === 'darwin'

  return false
})()

function normalizeModifier(modifier) {
  modifier = modifier.trim().toLowerCase()

  if (!ALL_MODIFIERS.includes(modifier)) {
    throw new Error(
      `invalid modifier key: ${modifier} - must be one of: ${ALL_MODIFIERS.join(', ')}`
    )
  }

  return modifier
}

// Maps 'ctrl' modifier to the command key on macOS
const getPlatformSpecificModifier = (modifier) =>
  isMacOS && modifier === 'ctrl' ? 'meta' : modifier

const eventUsesModifier = (event, modifier) => event[`${modifier}Key`]

function isTargetKeyboardEvent(event, desiredModifiers, key) {
  if (event.key.toLowerCase() !== key) return false

  const unusedModifiers = ALL_MODIFIERS.filter((mod) => !desiredModifiers.includes(mod))
  return (
    desiredModifiers.every((mod) => eventUsesModifier(event, mod)) &&
    unusedModifiers.every((mod) => !eventUsesModifier(event, mod))
  )
}

module.exports = function useHotKey(desiredModifiersString, key, callback) {
  key = key.toLowerCase()
  const desiredModifiers = useMemo(
    () =>
      desiredModifiersString
        .split('+')
        .filter((mod) => mod)
        .map(normalizeModifier)
        .map(getPlatformSpecificModifier),
    [desiredModifiersString]
  )

  const handleKeyDown = useCallback(
    (event) => {
      if (isTargetKeyboardEvent(event, desiredModifiers, key)) {
        event.preventDefault()
        callback()
      }
    },
    [desiredModifiers, key, callback]
  )

  useEffect(
    () => {
      // TODO print a console warning when multiple callbacks are bound to the same hotkey
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('keydown', handleKeyDown)
      }
    },
    [desiredModifiers, key, handleKeyDown]
  )
}
