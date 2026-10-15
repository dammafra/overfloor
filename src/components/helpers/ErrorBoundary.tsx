import React, { type ErrorInfo, type PropsWithChildren } from 'react'

type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error)
    console.info(errorInfo)
  }

  render() {
    if (this.state.hasError)
      return (
        <div className="page">
          <p className="mb-5 text-center text-4xl text-balance text-white text-stroke-black">
            This wasn’t supposed to fall apart...
          </p>
          <button
            className="button"
            onClick={() => {
              window.location.href = window.location.origin
            }}
          >
            retry
          </button>
        </div>
      )
    return this.props.children
  }
}
