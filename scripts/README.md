# Scripts

## React Import Consistency Checker

### Purpose
Ensures all React imports across the codebase use the namespace import pattern:
```typescript
import * as React from "react";
```

This prevents `Cannot read properties of null (reading 'useState')` errors caused by inconsistent React context.

### Usage

Run the check manually:
```bash
node scripts/check-react-imports.js
```

### What it checks
- ✅ Enforces `import * as React from "react"`
- ❌ Disallows `import { useState, useEffect } from "react"`
- ❌ Disallows `import React, { useState } from "react"`

### Integration

This check is also enforced via ESLint rules in `eslint.config.js` with the `no-restricted-imports` rule.

To run ESLint checks:
```bash
npm run lint
```

### Why this matters
React hooks like `useState`, `useEffect`, etc. rely on React's internal context. When different import styles are mixed across files, it can cause React's context to become null, leading to runtime errors.

By enforcing a single import pattern, we ensure all components share the same React context.
