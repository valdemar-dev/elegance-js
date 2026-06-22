import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllJsFiles(dir) {
    let files = [];

    fs.readdirSync(dir, { withFileTypes: true }).forEach(file => {
        const fullPath = path.join(dir, file.name);
        if (file.isDirectory()) {
            files = files.concat(getAllJsFiles(fullPath));
        } else if (file.name.endsWith('.js')) {
            files.push(fullPath);
        }
    });

    return files;
    }

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    content = content.replace(
        /from\s+(['"])(\.{1,2}\/[^'"]+?)\1/g,
        (match, quote, importPath) => {
            if (importPath.endsWith('/') || /\.[^/]+$/.test(importPath)) {
                return match;
            }

            return `from ${quote}${importPath}.js${quote}`;
        }
    );

    fs.writeFileSync(filePath, content, 'utf8');
}

const distDir = path.resolve(__dirname, '../dist');
const jsFiles = getAllJsFiles(distDir);

jsFiles.forEach(fixImports);

console.log('Fixed imports in', jsFiles.length, 'files.');