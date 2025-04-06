/**
 * Gère les erreurs de requête
 * @param error L'erreur à gérer
 */
export const handleQueryError = (error: Error): void => {
  if (error.name === "AbiEncodingLengthMismatchError") {
    console.error("[Contract Error]", {
      type: "ABI Encoding Error",
      message:
        "Erreur de paramètres du contrat. Vérifiez que tous les paramètres requis sont fournis.",
      details: error.message,
    });
    return;
  }

  console.error("[Query Error]", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
};

/**
 * Gère les erreurs de mutation
 * @param error L'erreur à gérer
 */
export const handleMutationError = (error: Error): void => {
  if (error.name === "AbiEncodingLengthMismatchError") {
    console.error("[Contract Error]", {
      type: "ABI Encoding Error",
      message:
        "Erreur de paramètres du contrat. Vérifiez que tous les paramètres requis sont fournis.",
      details: error.message,
    });
    return;
  }

  console.error("[Mutation Error]", {
    name: error.name,
    message: error.message,
    stack: error.stack,
  });
};
