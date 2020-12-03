require('jsdom-global')()
const React = require('react')
const ReactDOM = require('react-dom')
const useHotKey = require('.')
const assert = require('assert')

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function simulateKeyPress(modifiers, key) {
  const event = new KeyboardEvent('keydown', {
    key,
    altKey:   modifiers.includes('alt'),
    ctrlKey:  modifiers.includes('ctrl'),
    shiftKey: modifiers.includes('shift'),
    metaKey:  modifiers.includes('meta'),
  })

  document.dispatchEvent(event)
}

function Component({ string, setString }) {
  const handleControlShiftG = React.useCallback(
    () => {
      setString(string + ' bar')
    },
    [setString, string]
  )

  useHotKey('ctrl+shift', 'g', handleControlShiftG)

  return null
}

class Parent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hide: false,
      string: '',
      setString: (string) => this.setState({ string }),
    }
  }

  async componentDidMount() {
    // child mounted, so pressing the hot key should change the state
    await sleep(50)
    simulateKeyPress(['ctrl', 'shift'], 'g')
    await sleep(50)
    assert.equal(this.state.string, ' bar')
    await sleep(50)

    // make sure the hotkey listener handles dep changes
    this.setState({ string: 'foo' })
    await sleep(50)
    simulateKeyPress(['ctrl', 'shift'], 'g')
    await sleep(50)
    assert.equal(this.state.string, 'foo bar')

    // component is unmounted, listener should be gone now
    this.setState({ hide: true, string: '' })
    await sleep(50)
    simulateKeyPress(['ctrl', 'shift'], 'g')
    await sleep(50)
    assert.equal(this.state.string, '')

    // All good!
    console.log('Test successful.')
  }

  render() {
    if (this.state.hide) {
      return null
    }
    return React.createElement(Component, this.state)
  }
}

const root = document.createElement('div')
document.body.appendChild(root)
ReactDOM.render(React.createElement(Parent), root)
