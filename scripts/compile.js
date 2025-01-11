const fs = require("fs");
const path = require("path");
const solc = require("solc");

const contractPath = path.resolve(
  __dirname,
  "..",
  "src",
  "contracts",
  "CustomToken.sol",
);
const source = fs.readFileSync(contractPath, "utf8");

function findImports(path) {
  if (path.startsWith("@openzeppelin/")) {
    const npmPath = path.replace("@openzeppelin/", "");
    const filePath = require.resolve(`@openzeppelin/${npmPath}`);
    return {
      contents: fs.readFileSync(filePath, "utf8"),
    };
  }
  return { error: "File not found" };
}

const input = {
  language: "Solidity",
  sources: {
    "CustomToken.sol": {
      content: source,
    },
  },
  settings: {
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

const output = JSON.parse(
  solc.compile(JSON.stringify(input), { import: findImports }),
);

if (output.errors) {
  console.error("Compilation errors:", output.errors);
  process.exit(1);
}

// Écrire le bytecode dans un fichier
const bytecode =
  output.contracts["CustomToken.sol"].CustomToken.evm.bytecode.object;
const abi = output.contracts["CustomToken.sol"].CustomToken.abi;

// Créer le fichier de sortie
const compiledOutput = {
  bytecode: bytecode,
  abi: abi,
};

const outputPath = path.resolve(
  __dirname,
  "..",
  "src",
  "contracts",
  "compiled.json",
);
fs.writeFileSync(outputPath, JSON.stringify(compiledOutput, null, 2));

console.log(
  "Compilation terminée ! Le bytecode et l'ABI ont été sauvegardés dans compiled.json",
);
