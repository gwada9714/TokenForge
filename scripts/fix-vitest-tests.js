const fs = require('fs');
const path = require('path');

// Mapping des remplacements
const replacements = [
  // Supprimer les imports de jest-dom
  {
    from: /import\s+['"]@testing-library\/jest-dom.*?['"]/g,
    to: ''
  },
  // React Router DOM mocks
  {
    from: /jest\.mock\(['"]react-router-dom['"]\s*,\s*\(\)\s*=>\s*\(\{[\s\S]*?}\)\)/g,
    to: `vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: ({ children }) => children
  };
});`
  },
  // Remplacer les assertions jest-dom
  {
    from: /expect\((.*?)\)\.toBeInTheDocument\(\)/g,
    to: 'expect($1).toBeTruthy()'
  },
  {
    from: /expect\((.*?)\)\.not\.toBeInTheDocument\(\)/g,
    to: 'expect($1).toBeFalsy()'
  },
  {
    from: /expect\((.*?)\)\.toBeVisible\(\)/g,
    to: 'expect($1).toBeTruthy()'
  },
  {
    from: /expect\((.*?)\)\.toHaveTextContent\((.*?)\)/g,
    to: 'expect($1.textContent).toBe($2)'
  },
  {
    from: /expect\((.*?)\)\.toHaveValue\((.*?)\)/g,
    to: 'expect($1.value).toBe($2)'
  },
  // Module imports
  {
    from: /const\s*{\s*(.*?)\s*}\s*=\s*require\(['"]wagmi['"]\)/g,
    to: 'import { $1 } from "wagmi"'
  },
  // Fix mock implementations
  {
    from: /jest\.spyOn/g,
    to: 'vi.spyOn'
  },
  {
    from: /\.mockImplementation/g,
    to: '.mockImplementation'
  },
  // Supprimer les références à jest restantes
  {
    from: /jest\./g,
    to: 'vi.'
  }
];

function processFile(filePath) {
  console.log(`Processing ${filePath}...`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const replacement of replacements) {
    if (content.match(replacement.from)) {
      content = content.replace(replacement.from, replacement.to);
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
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) {
      processFile(filePath);
    }
  });
}

// Démarrer le traitement depuis le répertoire src
processDirectory(path.join(__dirname, '..', 'src'));
