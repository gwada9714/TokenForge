// Fonction utilitaire pour charger un fichier WASM
export async function loadWasmModule(url: string): Promise<WebAssembly.Module> {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    return WebAssembly.compile(buffer);
  } catch (error) {
    console.error('Error loading WASM module:', error);
    throw error;
  }
}
