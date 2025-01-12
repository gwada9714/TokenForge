import { useState } from 'react';

interface TestFormProps {
  onSubmit: (params: any) => Promise<void>;
  disabled: boolean;
}

export const TestForm = ({ onSubmit, disabled }: TestFormProps) => {
  const [testParams, setTestParams] = useState({
    amount: '',
    recipient: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(testParams);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            value={testParams.amount}
            onChange={e => setTestParams(prev => ({ ...prev, amount: e.target.value }))}
            className="input"
            placeholder="Enter amount"
            disabled={disabled}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <input
            type="text"
            value={testParams.recipient}
            onChange={e => setTestParams(prev => ({ ...prev, recipient: e.target.value }))}
            className="input"
            placeholder="0x..."
            disabled={disabled}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="btn btn-primary w-full"
      >
        {disabled ? 'Processing...' : 'Run Test'}
      </button>
    </form>
  );
}; 