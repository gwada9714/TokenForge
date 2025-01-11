const SOLC_VERSION = '0.8.20';
const SOLC_CDN = `https://binaries.soliditylang.org/bin/soljson-v${SOLC_VERSION}+commit.a1b79de6.js`;

let solcPromise: Promise<any> | null = null;

function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

export async function loadSolc() {
  if (solcPromise) return solcPromise;

  solcPromise = new Promise(async (resolve, reject) => {
    try {
      // Charger le script du compilateur
      await loadScript(SOLC_CDN);

      // Attendre que le module soit disponible
      const wrapper = await import('solc/wrapper');
      
      // @ts-ignore
      if (typeof window.Module === 'undefined') {
        throw new Error('Solc module not loaded correctly');
      }

      // @ts-ignore
      const solc = wrapper.default(window.Module);
      resolve(solc);
    } catch (error) {
      solcPromise = null;
      reject(error);
    }
  });

  return solcPromise;
}

export async function compile(source: string, settings: any = null) {
  const solc = await loadSolc();

  const input = {
    language: 'Solidity',
    sources: {
      'contract.sol': {
        content: source
      }
    },
    settings: settings || {
      outputSelection: {
        '*': {
          '*': ['*']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const output = JSON.parse(solc.compile(JSON.stringify(input)));
      resolve(output);
    } catch (error) {
      reject(error);
    }
  });
}
