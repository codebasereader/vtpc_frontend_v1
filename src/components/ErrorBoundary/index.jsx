import { Component } from 'react'
import { common } from '../../language/common'

// Class component (error boundaries must be classes), so it reads the
// persisted language directly from storage rather than via a Redux hook.
function readPersistedLanguage() {
  try {
    return localStorage.getItem('vtpc_locale') === 'kn' ? 'kn' : 'en'
  } catch {
    return 'en'
  }
}

export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="p-6 text-center text-gray-700">
          {common.errorBoundary[readPersistedLanguage()]}
        </div>
      )
    }
    return this.props.children
  }
}
