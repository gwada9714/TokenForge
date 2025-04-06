import type { Plugin, IndexHtmlTransformContext } from "vite";
import crypto from "crypto";

export function vitePluginNonce(): Plugin {
  let nonce: string;

  return {
    name: "vite-plugin-nonce",
    configResolved(config) {
      // Générer un nouveau nonce au démarrage du serveur
      nonce = crypto.randomBytes(32).toString("base64");
      process.env.VITE_CSP_NONCE = nonce;
    },
    transformIndexHtml: {
      enforce: "post",
      transform(html: string) {
        // Remplacer tous les placeholders de nonce
        return html.replace(/%%VITE_NONCE%%/g, nonce);
      },
    },
    transform(code: string, id: string) {
      // Ne pas transformer les fichiers node_modules
      if (id.includes("node_modules")) {
        return null;
      }

      // Ajouter le nonce aux scripts React générés dynamiquement
      if (id.endsWith(".tsx") || id.endsWith(".jsx")) {
        return {
          code: code
            .replace(
              /React\.createElement\("script"/g,
              `React.createElement("script", { nonce: "${nonce}" }`
            )
            .replace(
              /React\.createElement\("style"/g,
              `React.createElement("style", { nonce: "${nonce}" }`
            ),
          map: null,
        };
      }

      // Ajouter le nonce aux styles générés dynamiquement
      if (id.endsWith(".css")) {
        return {
          code: `
            const style = document.createElement('style');
            style.nonce = "${nonce}";
            style.textContent = ${JSON.stringify(code)};
            document.head.appendChild(style);
          `,
          map: null,
        };
      }

      return null;
    },
    configureServer(server) {
      // Ajouter le nonce aux en-têtes de réponse
      server.middlewares.use((req, res, next) => {
        res.setHeader("x-nonce", nonce);
        next();
      });
    },
  };
}
