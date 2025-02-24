const fs = require('fs');
const path = require('path');

const updateImports = (content) => {
  // Remplacer les imports de wagmi
  content = content.replace(
    /import\s*{([^}]*)}\s*from\s*['"]wagmi['"];?/g,
    (match, imports) => {
      const newImports = imports
        .split(',')
        .map(i => i.trim())
        .filter(i => i !== 'useNetwork' && i !== 'useSwitchNetwork')
        .concat(['useSwitchChain'])
        .join(', ');
      return `import { ${newImports} } from 'wagmi';`;
    }
  );

  // Ajouter l'import de notre hook personnalisé si useNetwork est utilisé
  if (content.includes('useNetwork')) {
    if (!content.includes("from '../hooks/useNetwork'") && !content.includes("from '@/hooks/useNetwork'")) {
      const importStatement = "import { useNetwork } from '../hooks/useNetwork';\n";
      content = importStatement + content;
    }
  }

  // Remplacer useSwitchNetwork par useSwitchChain
  content = content.replace(/useSwitchNetwork/g, 'useSwitchChain');
  content = content.replace(/switchNetwork/g, 'switchChain');

  return content;
};

const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('wagmi')) {
      const updatedContent = updateImports(content);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

const walkDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && !file.includes('node_modules')) {
      walkDir(filePath);
    } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      processFile(filePath);
    }
  });
};

// Démarrer le processus
walkDir(path.resolve(__dirname, '../src'));
