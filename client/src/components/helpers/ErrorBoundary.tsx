import React, { type ErrorInfo, type PropsWithChildren } from 'react'

type State = { hasError: boolean }

interface ErrorBoundaryProps extends PropsWithChildren {
  onError?: (error: Error) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error)
    console.info(errorInfo)
    if (this.props.onError) this.props.onError(error)
  }

  render() {
    return this.props.children
  }
}
