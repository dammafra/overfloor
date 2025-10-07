import React, { type ErrorInfo, type PropsWithChildren } from 'react'
import { toast } from 'react-toastify'
import { Redirect } from 'wouter'

type State = { hasError: boolean }

export class ErrorBoundary extends React.Component<PropsWithChildren, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(error)
    console.info(errorInfo)
    toast.error('Something went wrong')
  }

  render() {
    if (this.state.hasError) {
      return <Redirect href="/" />
    }

    return this.props.children
  }
}
