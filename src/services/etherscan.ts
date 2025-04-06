import { config } from '../core/config';

const ETHERSCAN_API_BASE_URL = 'https://api.etherscan.io/api';

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export const etherscanService = {
  async getABI(contractAddress: string): Promise<string> {
    const url = new URL(ETHERSCAN_API_BASE_URL);
    url.searchParams.append('module', 'contract');
    url.searchParams.append('action', 'getabi');
    url.searchParams.append('address', contractAddress);
    url.searchParams.append('apikey', config.etherscan.apiKey);

    const response = await fetch(url.toString());
    const data: EtherscanResponse<string> = await response.json();

    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    return data.result;
  },

  async getContractSource(contractAddress: string): Promise<{
    SourceCode: string;
    ContractName: string;
    CompilerVersion: string;
  }> {
    const url = new URL(ETHERSCAN_API_BASE_URL);
    url.searchParams.append('module', 'contract');
    url.searchParams.append('action', 'getsourcecode');
    url.searchParams.append('address', contractAddress);
    url.searchParams.append('apikey', config.etherscan.apiKey);

    const response = await fetch(url.toString());
    const data: EtherscanResponse<Array<{
      SourceCode: string;
      ContractName: string;
      CompilerVersion: string;
    }>> = await response.json();

    if (data.status !== '1' || !data.result[0]) {
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    return data.result[0];
  },

  async getContractTransactions(contractAddress: string, page = 1, offset = 100): Promise<any[]> {
    const url = new URL(ETHERSCAN_API_BASE_URL);
    url.searchParams.append('module', 'account');
    url.searchParams.append('action', 'txlist');
    url.searchParams.append('address', contractAddress);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('offset', offset.toString());
    url.searchParams.append('sort', 'desc');
    url.searchParams.append('apikey', config.etherscan.apiKey);

    const response = await fetch(url.toString());
    const data: EtherscanResponse<any[]> = await response.json();

    if (data.status !== '1') {
      throw new Error(`Etherscan API error: ${data.message}`);
    }

    return data.result;
  }
};
