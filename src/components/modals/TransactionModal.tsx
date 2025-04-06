import React, { useState } from "react";
import { useWeb3Contract } from "../../hooks";
import { useSnackbar } from "notistack";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "transfer" | "mint" | "burn";
  tokenAddress: string;
  tokenSymbol: string;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  tokenAddress,
  tokenSymbol,
}) => {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { executeTransaction } = useWeb3Contract();
  const [errors, setErrors] = useState<{
    amount?: string;
    recipient?: string;
  }>({});

  const getModalTitle = () => {
    switch (type) {
      case "transfer":
        return `Transférer des ${tokenSymbol}`;
      case "mint":
        return `Créer des ${tokenSymbol}`;
      case "burn":
        return `Brûler des ${tokenSymbol}`;
      default:
        return "Transaction";
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Montant invalide";
    }

    if (type === "transfer" && !recipient) {
      newErrors.recipient = "Destinataire requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      switch (type) {
        case "transfer":
          await executeTransaction({
            type: "transfer",
            tokenAddress,
            recipient,
            amount,
          });
          break;
        case "mint":
          await executeTransaction({
            type: "mint",
            tokenAddress,
            amount,
          });
          break;
        case "burn":
          await executeTransaction({
            type: "burn",
            tokenAddress,
            amount,
          });
          break;
      }

      enqueueSnackbar("Transaction réussie", { variant: "success" });
      onClose();
    } catch (error) {
      enqueueSnackbar(
        error instanceof Error ? error.message : "Une erreur est survenue",
        { variant: "error" }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{getModalTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <span className="sr-only">Fermer</span>
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Montant en ${tokenSymbol}`}
              className={`w-full px-3 py-2 border rounded-md ${
                errors.amount ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              min="0"
              step="any"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
            )}
          </div>

          {type === "transfer" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destinataire
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Adresse du destinataire"
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.recipient ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.recipient && (
                <p className="mt-1 text-sm text-red-600">{errors.recipient}</p>
              )}
            </div>
          )}

          <p className="text-sm text-gray-500">Token: {tokenAddress}</p>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md ${
                isLoading
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-700"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              {isLoading ? "En cours..." : "Confirmer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
