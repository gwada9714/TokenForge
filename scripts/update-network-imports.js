const fs = require('fs');
const path = require('path');

const updateImports = (content, filePath) => {
  // Corriger les chemins d'importation absolus
  content = content.replace(
    /from\s*['"]\/useNetwork['"]/g,
    "from './useNetwork'"
  );

  // Si le fichier importe déjà useNetwork depuis notre hook personnalisé, ne rien faire
  if (content.includes("from '../hooks/useNetwork'") || content.includes("from '@/hooks/useNetwork'")) {
    return content;
  }

  // Remplacer les imports de wagmi
  let updatedContent = content.replace(
    /import\s*{([^}]*)}\s*from\s*['"]wagmi['"];?/g,
    (match, imports) => {
      const importParts = imports.split(',').map(i => i.trim());
      const networkImports = importParts.filter(i => i === 'useNetwork' || i === 'useSwitchNetwork');
      const otherImports = importParts.filter(i => i !== 'useNetwork' && i !== 'useSwitchNetwork');
      
      if (networkImports.length === 0) {
        return match;
      }

      let result = '';
      if (otherImports.length > 0) {
        result += `import { ${otherImports.join(', ')} } from 'wagmi';\n`;
      }

      // Ajouter l'import de notre hook personnalisé
      const relativePath = path.relative(
        path.dirname(filePath),
        path.join(path.dirname(filePath), '..', 'hooks')
      ).replace(/\\/g, '/');

      result += `import { useNetwork } from '${relativePath}/useNetwork';`;
      return result;
    }
  );

  return updatedContent;
};

const processFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('useNetwork')) {
      const updatedContent = updateImports(content, filePath);
      if (updatedContent !== content) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`Updated ${filePath}`);
      }
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
