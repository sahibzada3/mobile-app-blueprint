#!/usr/bin/env node

/**
 * Script to check for inconsistent React imports across the codebase
 * Ensures all files use: import * as React from "react"
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const ALLOWED_PATTERN = /import \* as React from ['"]react['"]/;
const DISALLOWED_PATTERNS = [
  /import \{ [^}]+ \} from ['"]react['"]/,
  /import React, \{ [^}]+ \} from ['"]react['"]/,
];

const errors = [];
let filesChecked = 0;

function checkFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // Skip if line doesn't import from react
    if (!line.includes('from "react"') && !line.includes("from 'react'")) {
      return;
    }

    // Check for disallowed patterns
    const hasDisallowedPattern = DISALLOWED_PATTERNS.some(pattern => 
      pattern.test(line)
    );

    if (hasDisallowedPattern && !ALLOWED_PATTERN.test(line)) {
      errors.push({
        file: filePath,
        line: index + 1,
        content: line.trim(),
      });
    }
  });

  filesChecked++;
}

function scanDirectory(dir, extensions = ['.ts', '.tsx']) {
  const files = readdirSync(dir);

  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and dist
      if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
        scanDirectory(filePath, extensions);
      }
    } else if (extensions.includes(extname(file))) {
      checkFile(filePath);
    }
  });
}

console.log('🔍 Checking React imports consistency...\n');

scanDirectory('src');

console.log(`✅ Checked ${filesChecked} files\n`);

if (errors.length > 0) {
  console.error(`❌ Found ${errors.length} inconsistent React imports:\n`);
  errors.forEach(({ file, line, content }) => {
    console.error(`  ${file}:${line}`);
    console.error(`    ${content}`);
    console.error(`    Should use: import * as React from "react"\n`);
  });
  process.exit(1);
} else {
  console.log('✨ All React imports are consistent!\n');
  process.exit(0);
}
