import { ethers } from 'ethers'

interface EthereumEvent {
  readonly chainId: string
  readonly networkVersion: string
  readonly selectedAddress: string | null
}

type EthereumEventCallback = (event: Readonly<EthereumEvent>) => void

type EthereumEventType = 
  | 'chainChanged'
  | 'networkChanged'
  | 'accountsChanged'
  | 'connect'
  | 'disconnect'

interface EthereumProvider extends ethers.providers.ExternalProvider {
  readonly isMetaMask?: boolean
  readonly chainId?: string
  readonly networkVersion?: string
  readonly selectedAddress?: string | null
  on?: (event: EthereumEventType, callback: EthereumEventCallback) => void
  removeListener?: (event: EthereumEventType, callback: EthereumEventCallback) => void
}

declare global {
  interface Window {
    ethereum: EthereumProvider
  }
}

export interface WalletConnection {
  readonly address: string
  readonly signer: ethers.Signer
  readonly provider: ethers.providers.Web3Provider
  readonly chainId: number
}

export class WalletError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'WalletError'
    Object.setPrototypeOf(this, WalletError.prototype)
  }

  static notFound(): WalletError {
    return new WalletError(
      'MetaMask non détecté. Veuillez installer MetaMask.',
      'WALLET_NOT_FOUND'
    )
  }

  static userRejected(): WalletError {
    return new WalletError(
      'Connexion refusée par l\'utilisateur. Veuillez autoriser la connexion.',
      'USER_REJECTED'
    )
  }

  static addressError(cause?: unknown): WalletError {
    return new WalletError(
      'Impossible de récupérer l\'adresse du wallet. Veuillez réessayer.',
      'ADDRESS_ERROR',
      cause
    )
  }

  static networkError(cause?: unknown): WalletError {
    return new WalletError(
      'Impossible de récupérer les informations du réseau. Veuillez vérifier votre connexion.',
      'NETWORK_ERROR',
      cause
    )
  }
}

const isMetaMaskInstalled = (): boolean => {
  return window.ethereum?.isMetaMask === true
}

const getProvider = (): ethers.providers.Web3Provider => {
  if (!isMetaMaskInstalled()) {
    throw WalletError.notFound()
  }
  return new ethers.providers.Web3Provider(window.ethereum, 'any')
}

export const connectWallet = async (): Promise<WalletConnection> => {
  try {
    const provider = getProvider()
    
    try {
      await provider.send('eth_requestAccounts', [])
    } catch (error) {
      throw WalletError.userRejected()
    }

    const signer = provider.getSigner()
    let address: string
    let chainId: number
    
    try {
      [address, { chainId }] = await Promise.all([
        signer.getAddress(),
        provider.getNetwork()
      ])
    } catch (error) {
      if (error instanceof Error && error.message.includes('address')) {
        throw WalletError.addressError(error)
      } else {
        throw WalletError.networkError(error)
      }
    }
    
    return Object.freeze({
      address,
      signer,
      provider,
      chainId
    })
  } catch (error) {
    if (error instanceof WalletError) {
      console.error(`Erreur de connexion wallet (${error.code}):`, error.message)
      if (error.cause) {
        console.error('Caused by:', error.cause)
      }
    } else {
      console.error('Erreur inattendue:', error)
    }
    throw error
  }
} 