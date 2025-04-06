const fs = require("fs");
const path = require("path");

// Mapping des remplacements Jest -> Vitest
const replacements = {
  "jest.fn()": "vi.fn()",
  "jest.mock(": "vi.mock(",
  "jest.spyOn(": "vi.spyOn(",
  "jest.clearAllMocks()": "vi.clearAllMocks()",
  "jest.resetAllMocks()": "vi.resetAllMocks()",
  "jest.restoreAllMocks()": "vi.restoreAllMocks()",
  "jest.useFakeTimers()": "vi.useFakeTimers()",
  "jest.useRealTimers()": "vi.useRealTimers()",
  "jest.advanceTimersByTime(": "vi.advanceTimersByTime(",
  "jest.requireActual(": "vi.importActual(",
  "@testing-library/jest-dom": "@testing-library/jest-dom/vitest",
};

function convertFile(filePath) {
  console.log(`Converting ${filePath}...`);
  let content = fs.readFileSync(filePath, "utf8");
  let modified = false;

  // Remplacer les imports de jest par vitest
  if (content.includes("import { jest }")) {
    content = content.replace(/import\s*{\s*jest\s*}/g, "import { vi }");
    modified = true;
  }

  // Appliquer les remplacements
  for (const [from, to] of Object.entries(replacements)) {
    if (content.includes(from)) {
      content = content.replace(
        new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        to
      );
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✓ Updated ${filePath}`);
  } else {
    console.log(`- No changes needed in ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith(".test.ts") || file.endsWith(".test.tsx")) {
      convertFile(filePath);
    }
  });
}

// Démarrer la conversion depuis le répertoire src
processDirectory(path.join(__dirname, "..", "src"));
