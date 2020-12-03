# `use-hot-key`

`useHotKey` is a React hook which binds a hotkey combo to a callback for as long as the rendering component remains mounted. The hook automatically clears & rebinds the callback if the modifiers, key, or callback changes.

## Examples

To avoid constant rebinding, make sure to use [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) to create your callbacks.

Basic usage:
```js
const sayHello = useCallback(() => console.log('hi!'), [])
useHotKey('shift+ctrl', 'h', sayHello)
```

Caps and spaces in the modifiers and key strings don't matter:
```js
const sayHello = useCallback(() => console.log('hi!'), [])
useHotKey('shift + ALT', 'P', sayHello)
```

Can be used without modifier keys
```js
const unfocus = useCallback(() => inputRef.current.blur(), [inputRef])
useHotKey('', 'Escape', unfocus)
```

More than one callback can be bound for the same hotkey at once:
```js
const focusInput = useCallback(() => searchRef.current.focus(), [searchRef])
const blurOtherInput = useCallback(() => otherRef.current.blur(), [otherRef])
useHotKey('ctrl', 'f', focusInput)
useHotKey('ctrl', 'f', blurOtherInput)
```

## Warning

Care should be taken to avoid mounting multiple components (or multiple instances of the same component) at once which attempt to bind the same hotkey to different callbacks. If this happens, all callbacks will fire.
