export interface ErrorHandlingProps {
  onError: (message: string) => void;
}

export interface AdminComponentProps extends ErrorHandlingProps {
  // Autres props communs aux composants admin peuvent être ajoutés ici
}
