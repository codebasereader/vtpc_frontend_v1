import { Component } from 'react'

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
          Something went wrong. Please refresh the page.
        </div>
      )
    }
    return this.props.children
  }
}
