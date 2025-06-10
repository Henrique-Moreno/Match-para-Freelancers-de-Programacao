import React, { Component, ReactNode } from "react";
import Button from "./Button";
import styles from "./ErrorBoundary.module.css";

interface ErrorBoundaryProps {
  children: ReactNode;
  componentName?: string; 
  setError?: (error: string) => void; 
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Erro capturado pelo ErrorBoundary:", error, errorInfo);
    if (this.props.setError) {
      this.props.setError(`Erro no componente ${this.props.componentName || "desconhecido"}: ${error.message}`);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h3 className={styles.title}>Algo deu errado</h3>
          <p className={styles.message}>
            Ocorreu um erro ao carregar o componente {this.props.componentName || "desconhecido"}.
          </p>
          <Button label="Tentar Novamente" onClick={this.resetError} />
        </div>
      );
    }
    return this.props.children;
  }
}