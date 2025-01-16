/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

interface WBManifestEntry {
  revision: string | null;
  url: string;
}

declare const __WB_MANIFEST: Array<WBManifestEntry>;

export {};
