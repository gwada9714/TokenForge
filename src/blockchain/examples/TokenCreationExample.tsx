import React, { useState, useEffect } from 'react';
import { useBlockchain } from '../hooks/useBlockchain';
import { useTokenCreation } from '../hooks/useTokenCreation';
import { useTokenDeployment } from '../hooks/useTokenDeployment';
import { usePayment } from '../hooks/usePayment';
import { TokenConfig } from '../types';

/**
 * Exemple de composant React pour la création et le déploiement de tokens
 * Montre comment utiliser les différents hooks blockchain ensemble
 */
const TokenCreationExample: React.FC = () => {
  // État local
  const [selectedChain, setSelectedChain] = useState<string>('ethereum');
  const [tokenConfig, setTokenConfig] = useState<TokenConfig>({
    name: '',
    symbol: '',
    decimals: 18,
    initialSupply: 1000000,
    maxSupply: 10000000,
    burnable: true,
    mintable: true,
    antiWhale: {
      enabled: false,
      maxTransferPercent: 1,
      excludedAddresses: []
    },
    taxable: {
      enabled: false,
      buyTaxPercent: 0,
      sellTaxPercent: 0,
      transferTaxPercent: 0,
      taxRecipient: ''
    }
  });
  const [step, setStep] = useState<'connect' | 'configure' | 'payment' | 'deployment' | 'success'>('connect');
  const [pairWithToken, setPairWithToken] = useState<string>('');
  const [liquidityAmount, setLiquidityAmount] = useState<string>('0');

  // Hooks blockchain
  const { service: blockchainService, isConnected, networkId, error: connectionError } = 
    useBlockchain(selectedChain, window.ethereum);
  
  const { 
    validateToken, 
    estimateDeploymentCost, 
    error: creationError 
  } = useTokenCreation(selectedChain, window.ethereum);
  
  const {
    deployToken,
    setupAutoLiquidity,
    isDeploying,
    deploymentStatus,
    deploymentProgress,
    deploymentError,
    tokenAddress
  } = useTokenDeployment(selectedChain, window.ethereum);
  
  const {
    createPaymentSession,
    verifyPayment,
    calculateFees,
    isProcessing: isProcessingPayment,
    sessionId,
    error: paymentError
  } = usePayment(selectedChain, window.ethereum);

  // Effets
  useEffect(() => {
    // Réinitialiser l'étape si la connexion est perdue
    if (!isConnected && step !== 'connect') {
      setStep('connect');
    }
  }, [isConnected, step]);

  // Gestionnaires d'événements
  const handleChainChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedChain(e.target.value);
  };

  const handleConnect = async () => {
    if (isConnected) {
      setStep('configure');
    } else {
      // Demander à l'utilisateur de connecter son wallet
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
        } catch (error) {
          console.error('Failed to connect wallet:', error);
        }
      } else {
        alert('Please install a Web3 wallet like MetaMask');
      }
    }
  };

  const handleConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (name.includes('.')) {
      // Gérer les propriétés imbriquées (e.g., antiWhale.enabled)
      const [parent, child] = name.split('.');
      
      // Type safety for nested properties
      if (parent === 'antiWhale' || parent === 'taxable') {
        setTokenConfig(prev => ({
          ...prev,
          [parent]: {
            ...prev[parent as keyof TokenConfig],
            [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
          }
        }));
      }
    } else {
      // Gérer les propriétés de premier niveau
      setTokenConfig(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (
          type === 'number' ? Number(value) : value
        )
      }));
    }
  };

  const handleValidateConfig = async () => {
    const validation = await validateToken(tokenConfig);
    if (validation.valid) {
      // Estimer le coût de déploiement
      const cost = await estimateDeploymentCost(tokenConfig);
      console.log(`Estimated deployment cost: ${cost}`);
      setStep('payment');
    } else {
      alert(`Invalid configuration: ${validation.errors.join(', ')}`);
    }
  };

  const handleCreatePayment = async () => {
    // Calculer les frais
    const estimatedCost = await estimateDeploymentCost(tokenConfig) || 0n;
    const fees = await calculateFees(estimatedCost) || 0n;
    console.log(`Estimated fees: ${fees}`);
    
    // Créer une session de paiement
    const session = await createPaymentSession(estimatedCost + fees, selectedChain === 'ethereum' ? 'ETH' : 'NATIVE');
    if (session) {
      console.log(`Payment session created: ${session}`);
      // Dans une application réelle, on redirigerait vers une page de paiement
      // Pour cet exemple, on simule un paiement réussi
      setTimeout(() => {
        setStep('deployment');
      }, 2000);
    }
  };

  const handleDeployToken = async () => {
    const result = await deployToken(tokenConfig);
    if (result && result.tokenAddress) {
      console.log(`Token deployed at: ${result.tokenAddress}`);
      
      // Configurer la liquidité automatique si demandé
      if (pairWithToken && liquidityAmount) {
        const liquidityResult = await setupAutoLiquidity(
          result.tokenAddress,
          pairWithToken,
          BigInt(parseFloat(liquidityAmount) * 10**18)
        );
        console.log(`Auto-liquidity setup: ${liquidityResult ? 'Success' : 'Failed'}`);
      }
      
      setStep('success');
    }
  };

  // Rendu conditionnel selon l'étape
  const renderStep = () => {
    switch (step) {
      case 'connect':
        return (
          <div className="step-connect">
            <h2>Connect Your Wallet</h2>
            <div className="form-group">
              <label>Select Blockchain:</label>
              <select value={selectedChain} onChange={handleChainChange}>
                <option value="ethereum">Ethereum</option>
                <option value="binance">Binance Smart Chain</option>
                <option value="polygon">Polygon</option>
                <option value="avalanche">Avalanche</option>
                <option value="arbitrum">Arbitrum</option>
              </select>
            </div>
            <button onClick={handleConnect} disabled={isConnected}>
              {isConnected ? 'Connected' : 'Connect Wallet'}
            </button>
            {connectionError && <p className="error">{connectionError}</p>}
            {isConnected && (
              <div className="connection-info">
                <p>Connected to network ID: {networkId}</p>
                <button onClick={() => setStep('configure')}>Continue</button>
              </div>
            )}
          </div>
        );
        
      case 'configure':
        return (
          <div className="step-configure">
            <h2>Configure Your Token</h2>
            <div className="form-group">
              <label>Token Name:</label>
              <input
                type="text"
                name="name"
                value={tokenConfig.name}
                onChange={handleConfigChange}
                placeholder="My Token"
              />
            </div>
            <div className="form-group">
              <label>Token Symbol:</label>
              <input
                type="text"
                name="symbol"
                value={tokenConfig.symbol}
                onChange={handleConfigChange}
                placeholder="MTK"
              />
            </div>
            <div className="form-group">
              <label>Decimals:</label>
              <input
                type="number"
                name="decimals"
                value={tokenConfig.decimals.toString()}
                onChange={handleConfigChange}
                min="0"
                max="18"
              />
            </div>
            <div className="form-group">
              <label>Initial Supply:</label>
              <input
                type="number"
                name="initialSupply"
                value={tokenConfig.initialSupply}
                onChange={handleConfigChange}
                min="1"
              />
            </div>
            <div className="form-group">
              <label>Max Supply:</label>
              <input
                type="number"
                name="maxSupply"
                value={tokenConfig.maxSupply?.toString() || ''}
                onChange={handleConfigChange}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="burnable"
                  checked={tokenConfig.burnable}
                  onChange={handleConfigChange}
                />
                Burnable
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="mintable"
                  checked={tokenConfig.mintable}
                  onChange={handleConfigChange}
                />
                Mintable
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="antiWhale.enabled"
                  checked={tokenConfig.antiWhale?.enabled}
                  onChange={handleConfigChange}
                />
                Enable Anti-Whale
              </label>
            </div>
            {tokenConfig.antiWhale?.enabled && (
              <div className="form-group">
                <label>Max Transfer Percent:</label>
                <input
                  type="number"
                  name="antiWhale.maxTransferPercent"
                  value={tokenConfig.antiWhale?.maxTransferPercent}
                  onChange={handleConfigChange}
                  min="0.1"
                  max="100"
                  step="0.1"
                />
              </div>
            )}
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="taxable.enabled"
                  checked={tokenConfig.taxable?.enabled}
                  onChange={handleConfigChange}
                />
                Enable Tax
              </label>
            </div>
            {tokenConfig.taxable?.enabled && (
              <>
                <div className="form-group">
                  <label>Buy Tax (%):</label>
                  <input
                    type="number"
                    name="taxable.buyTaxPercent"
                    value={tokenConfig.taxable?.buyTaxPercent}
                    onChange={handleConfigChange}
                    min="0"
                    max="25"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Sell Tax (%):</label>
                  <input
                    type="number"
                    name="taxable.sellTaxPercent"
                    value={tokenConfig.taxable?.sellTaxPercent}
                    onChange={handleConfigChange}
                    min="0"
                    max="25"
                    step="0.1"
                  />
                </div>
                <div className="form-group">
                  <label>Tax Recipient:</label>
                  <input
                    type="text"
                    name="taxable.taxRecipient"
                    value={tokenConfig.taxable?.taxRecipient}
                    onChange={handleConfigChange}
                    placeholder="0x..."
                  />
                </div>
              </>
            )}
            <div className="form-actions">
              <button onClick={() => setStep('connect')}>Back</button>
              <button onClick={handleValidateConfig}>Next</button>
            </div>
            {creationError && <p className="error">{creationError}</p>}
          </div>
        );
        
      case 'payment':
        return (
          <div className="step-payment">
            <h2>Payment</h2>
            <p>Please complete the payment to deploy your token.</p>
            {isProcessingPayment ? (
              <p>Processing payment...</p>
            ) : (
              <button onClick={handleCreatePayment}>Pay Now</button>
            )}
            {sessionId && <p>Payment session: {sessionId}</p>}
            {paymentError && <p className="error">{paymentError}</p>}
            <div className="form-actions">
              <button onClick={() => setStep('configure')} disabled={isProcessingPayment}>Back</button>
            </div>
          </div>
        );
        
      case 'deployment':
        return (
          <div className="step-deployment">
            <h2>Token Deployment</h2>
            <div className="deployment-options">
              <h3>Auto-Liquidity Options (Optional)</h3>
              <div className="form-group">
                <label>Pair With Token:</label>
                <input
                  type="text"
                  value={pairWithToken}
                  onChange={(e) => setPairWithToken(e.target.value)}
                  placeholder="0x... (e.g., WETH address)"
                />
              </div>
              <div className="form-group">
                <label>Liquidity Amount:</label>
                <input
                  type="text"
                  value={liquidityAmount}
                  onChange={(e) => setLiquidityAmount(e.target.value)}
                  placeholder="Amount to add as liquidity"
                />
              </div>
            </div>
            {isDeploying ? (
              <div className="deployment-progress">
                <p>Deploying token... {deploymentProgress}%</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${deploymentProgress}%` }}></div>
                </div>
                <p>Status: {deploymentStatus}</p>
              </div>
            ) : (
              <button onClick={handleDeployToken}>Deploy Token</button>
            )}
            {deploymentError && <p className="error">{deploymentError}</p>}
            <div className="form-actions">
              <button onClick={() => setStep('payment')} disabled={isDeploying}>Back</button>
            </div>
          </div>
        );
        
      case 'success':
        return (
          <div className="step-success">
            <h2>Deployment Successful!</h2>
            <p>Congratulations! Your token has been successfully deployed.</p>
            <div className="token-info">
              <p><strong>Token Address:</strong> {tokenAddress}</p>
              <p><strong>Token Name:</strong> {tokenConfig.name}</p>
              <p><strong>Token Symbol:</strong> {tokenConfig.symbol}</p>
            </div>
            <button onClick={() => {
              // Réinitialiser le formulaire pour un nouveau token
              setTokenConfig({
                name: '',
                symbol: '',
                decimals: 18,
                initialSupply: 1000000,
                maxSupply: 10000000,
                burnable: true,
                mintable: true,
                antiWhale: {
                  enabled: false,
                  maxTransferPercent: 1,
                  excludedAddresses: []
                },
                taxable: {
                  enabled: false,
                  buyTaxPercent: 0,
                  sellTaxPercent: 0,
                  transferTaxPercent: 0,
                  taxRecipient: ''
                }
              });
              setStep('connect');
            }}>Create Another Token</button>
          </div>
        );
    }
  };

  return (
    <div className="token-creation-example">
      <h1>TokenForge - Create Your Token</h1>
      <div className="steps-indicator">
        <div className={`step ${step === 'connect' ? 'active' : ''} ${isConnected ? 'completed' : ''}`}>Connect</div>
        <div className={`step ${step === 'configure' ? 'active' : ''} ${step === 'payment' || step === 'deployment' || step === 'success' ? 'completed' : ''}`}>Configure</div>
        <div className={`step ${step === 'payment' ? 'active' : ''} ${step === 'deployment' || step === 'success' ? 'completed' : ''}`}>Payment</div>
        <div className={`step ${step === 'deployment' ? 'active' : ''} ${step === 'success' ? 'completed' : ''}`}>Deployment</div>
        <div className={`step ${step === 'success' ? 'active' : ''}`}>Success</div>
      </div>
      {renderStep()}
    </div>
  );
};

export default TokenCreationExample;
