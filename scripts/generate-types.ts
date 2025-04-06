import { runTypeChain, glob } from "typechain";

async function main() {
  const cwd = process.cwd();
  const files = glob(cwd, ["./artifacts/contracts/**/*.json"]);

  await runTypeChain({
    cwd,
    filesToProcess: files,
    allFiles: files,
    outDir: "src/typechain",
    target: "ethers-v6",
  });
}

main().catch(console.error);
