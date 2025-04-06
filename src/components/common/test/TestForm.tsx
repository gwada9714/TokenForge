import { useState } from "react";
import { defaultChain, tokenFactoryConfig } from "../../../config/web3Config";

interface TestFormProps {
  onSubmit: (params: any) => Promise<void>;
  disabled: boolean;
}

export const TestForm = ({ onSubmit, disabled }: TestFormProps) => {
  const [testParams, setTestParams] = useState({
    amount: "",
    recipient: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(testParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          value={testParams.amount}
          onChange={(e) =>
            setTestParams((prev) => ({ ...prev, amount: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter amount"
          disabled={disabled}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Recipient Address
        </label>
        <input
          type="text"
          value={testParams.recipient}
          onChange={(e) =>
            setTestParams((prev) => ({ ...prev, recipient: e.target.value }))
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="0x..."
          disabled={disabled}
        />
      </div>

      <button
        type="submit"
        disabled={disabled}
        className={`w-full py-2 px-4 rounded-md ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {disabled ? "Processing..." : "Run Test"}
      </button>
    </form>
  );
};
