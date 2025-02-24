import { toast } from 'react-hot-toast';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export function useErrorHandler() {
  const handleError = (error: unknown) => {
    const errorWithMessage = toErrorWithMessage(error);
    
    // Personnalisation des messages d'erreur
    let displayMessage = errorWithMessage.message;
    
    if (displayMessage.includes('user rejected transaction')) {
      displayMessage = 'Transaction rejetée par l\'utilisateur';
    } else if (displayMessage.includes('insufficient funds')) {
      displayMessage = 'Fonds insuffisants pour effectuer la transaction';
    } else if (displayMessage.includes('nonce too low')) {
      displayMessage = 'Erreur de nonce : veuillez rafraîchir votre page';
    } else if (displayMessage.includes('gas required exceeds allowance')) {
      displayMessage = 'Limite de gas dépassée';
    }

    // Affichage de l'erreur
    toast.error(displayMessage);

    // Log pour le débogage
    console.error('Error details:', error);
  };

  return { handleError };
}
