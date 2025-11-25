#!/usr/bin/env node

/**
 * Script to automatically fix React hook usages to use namespace pattern
 * Replaces useState with React.useState, etc.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const hookReplacements = [
  { from: /\buseState\b/g, to: 'React.useState' },
  { from: /\buseEffect\b/g, to: 'React.useEffect' },
  { from: /\buseCallback\b/g, to: 'React.useCallback' },
  { from: /\buseMemo\b/g, to: 'React.useMemo' },
  { from: /\buseRef\b/g, to: 'React.useRef' },
  { from: /\buseContext\b/g, to: 'React.useContext' },
  { from: /\bforwardRef\b/g, to: 'React.forwardRef' },
  { from: /\bmemo\b/g, to: 'React.memo' },
  { from: /\bcreateContext\b/g, to: 'React.createContext' },
];

let filesFixed = 0;
let replacements Made = 0;

function fixFile(filePath) {
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  
  // Skip if file doesn't import React
  if (!content.includes('import * as React from')) {
    return;
  }
  
  // Apply all replacements
  let fileChanged = false;
  hookReplacements.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      content = content.replace(from, to);
      replacementsMade += matches.length;
      fileChanged = true;
    }
  });
  
  if (fileChanged && content !== originalContent) {
    writeFileSync(filePath, content, 'utf-8');
    filesFixed++;
    console.log(`✓ Fixed: ${filePath}`);
  }
}

function scanDirectory(dir, extensions = ['.ts', '.tsx']) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git' && file !== 'scripts') {
        scanDirectory(filePath, extensions);
      }
    } else if (extensions.includes(extname(file))) {
      fixFile(filePath);
    }
  });
}

console.log('🔧 Fixing React hook usages...\n');

scanDirectory('src');

console.log(`\n✅ Fixed ${filesFixed} files with ${replacementsMade} replacements\n`);
