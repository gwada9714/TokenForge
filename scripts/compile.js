import fs from "fs";
import path from "path";
import solc from "solc";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(
  __dirname,
  "..",
  "src",
  "contracts",
  "CustomToken.sol"
);
const source = fs.readFileSync(contractPath, "utf8");

function findImports(path) {
  if (path.startsWith("@openzeppelin/")) {
    const npmPath = require.resolve(path, { paths: [process.cwd()] });
    return { contents: fs.readFileSync(npmPath, "utf8") };
  } else {
    console.error("File not found");
    return { error: "File not found" };
  }
}

const input = {
  language: "Solidity",
  sources: {
    "CustomToken.sol": {
      content: source,
    },
  },
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["*"],
      },
    },
  },
};

try {
  const output = JSON.parse(
    solc.compile(JSON.stringify(input), { import: findImports })
  );

  if (output.errors) {
    console.error("Compilation errors:");
    console.error(output.errors);
    process.exit(1);
  }

  const contract = output.contracts["CustomToken.sol"]["CustomToken"];

  const compiledContract = {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };

  fs.writeFileSync(
    path.resolve(__dirname, "..", "src", "contracts", "compiled.json"),
    JSON.stringify(compiledContract, null, 2)
  );

  console.log(
    "Compilation terminée ! Le bytecode et l'ABI ont été sauvegardés dans compiled.json"
  );
} catch (error) {
  console.error("Error:", error);
  process.exit(1);
}
