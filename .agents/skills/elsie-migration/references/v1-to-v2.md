# Migrating to elsie v2

This playbook covers every change a consumer package must make to be compatible
with `@adobe-commerce/elsie@2.0`. The changes fall into five areas: package
metadata, tooling config files, Storybook, TypeScript, and test files.

> **yarn or npm?** Commands below are shown for both. Quick reference: | Action
> | yarn | npm | |---|---|---| | Install deps | `yarn install` | `npm install` |
> | Add a dev dep | `yarn add -D <pkg>` | `npm install --save-dev <pkg>` | | Run
> a script | `yarn <script>` | `npm run <script>` | | Run a script with flags |
> `yarn <script> --flag` | `npm run <script> -- --flag` |

---

## 1. `package.json`

### 1a. Add `"type": "module"`

elsie v2 config files are ES modules. Add this at the top level of
`package.json`:

```json
"type": "module",
```

### 1b. Bump `@adobe-commerce/elsie`

```json
"@adobe-commerce/elsie": "2.0.0"
```

### 1c. Remove `concurrently` and `wait-on` from `devDependencies`

These are now bundled inside elsie. Remove the entries from `devDependencies`:

```diff
- "concurrently": "...",
- "wait-on": "...",
```

### 1d. Replace their usage in `scripts`

Wrap any `concurrently` and `wait-on` calls with `elsie`:

```diff
- "dev": "concurrently 'npm run storybook' 'npm run serve'",
+ "dev": "elsie concurrently 'npm run storybook' 'npm run serve'",

- "serve": "concurrently 'elsie serve' 'wait-on tcp:3002 && ...'",
+ "serve": "elsie concurrently 'elsie serve' 'elsie wait-on tcp:3002 && ...'",
```

### 1e. Set the Prettier config key (replaces `prettier.config.js`)

Add to `package.json`:

```json
"prettier": "@adobe-commerce/elsie/config/prettier.json",
```

Then **delete** `prettier.config.js` — it is no longer needed.

### 1f. Declare `jest`, `typescript`, and `jest-environment-jsdom` explicitly

Check which of the three packages are installed and at what version:

```bash
npx tsc --version
npm list jest jest-environment-jsdom
```

The minimum required versions are:

| Package                  | Minimum   |
| ------------------------ | --------- |
| `typescript`             | `^6.0.0`  |
| `jest`                   | `^30.4.2` |
| `jest-environment-jsdom` | `^30.0.0` |

For any package that is missing or below its minimum, install or upgrade it. You
can do all three in one command:

```bash
yarn add -D typescript@^6.0.0 jest@^30.4.2 jest-environment-jsdom@^30.0.0
# npm
npm install --save-dev typescript@^6.0.0 jest@^30.4.2 jest-environment-jsdom@^30.0.0
```

If a package is already at or above its minimum, omit it from the command.

**Why they must be explicit.** Jest resolves `testEnvironment`, `jest` itself,
and the TypeScript compiler from the _consuming project's_ `node_modules`,
starting at the project root — not from inside elsie's own directory. Even if
elsie declares them as `dependencies`, npm will not hoist them to a location
Jest can see.

**Why yarn v1 worked without them.** Yarn v1 aggressively flattens and hoists
the entire dependency tree to the workspace root, including the
`devDependencies` of local workspace packages. This means
`jest-environment-jsdom` (and others) would land at the root as a side effect,
making them resolvable — but that behaviour is specific to yarn v1 workspaces
and cannot be relied upon with npm.

**Why `jest-environment-jsdom` in particular.** elsie's `jest.config.mjs` sets
`testEnvironment: 'jsdom'`. Jest resolves this string to the
`jest-environment-jsdom` package from your project root. If that package isn't
present there, Jest fails with a "Cannot find module" error regardless of
whether the package exists deeper in `node_modules`.

### 1g. Remove `@changesets/cli` from `devDependencies` (if present)

elsie v2 bundles the changeset CLI. Remove the entry from `devDependencies`:

```diff
- "@changesets/cli": "...",
```

### 1h. Replace `changeset` script calls with `elsie changeset`

```diff
- "changeset": "changeset",
+ "changeset": "elsie changeset",

- "changeset:status": "changeset status",
+ "changeset:status": "elsie changeset status",

- "changeset:version": "changeset version",
+ "changeset:version": "elsie changeset version",

- "changeset:publish": "changeset publish",
+ "changeset:publish": "elsie changeset publish",

- "changeset:alpha": "changeset version --snapshot alpha",
+ "changeset:alpha": "elsie changeset version --snapshot alpha",
```

Only migrate the scripts that exist in your `package.json` — not all packages
use every variant.

---

## 2. ESLint — replace `.eslintrc.js` with `eslint.config.js`

**Delete** `.eslintrc.js`.

**Create** `eslint.config.js` using ESM flat config. Because the package now has
`"type": "module"`, a plain `.js` file is interpreted as ESM.

Minimal example (no Cypress):

```js
import base, {
  sourceImportRestrictions,
} from '@adobe-commerce/elsie/config/eslint.mjs';

export default [...base, ...sourceImportRestrictions];
```

If the package has a Cypress test suite, ensure `eslint-plugin-cypress` is at
least `^6.4.0`. Check the installed version first:

```bash
npm list eslint-plugin-cypress
```

If it is missing or below `6.4.0`, install or upgrade it:

```bash
yarn add -D eslint-plugin-cypress@^6.4.0
# npm
npm install --save-dev eslint-plugin-cypress@^6.4.0
```

```js
import base, {
  sourceImportRestrictions,
  cypress,
} from '@adobe-commerce/elsie/config/eslint.mjs';

export default [...base, ...sourceImportRestrictions, ...cypress];
```

After creating `eslint.config.js`, run the linter and fix any reported issues
before continuing:

```bash
yarn lint
# npm
npm run lint
```

Address all errors. Common issues after the flat-config migration: rules that
were silently ignored under the old config now surface, import-order violations,
and any `no-unused-vars` or `@typescript-eslint` errors that the old
`.eslintrc.js` had disabled.

---

## 3. Cypress — `cypress/tsconfig.json`

If the package has a Cypress test suite, create `cypress/tsconfig.json`. Cypress
uses `ts-node` internally to load `cypress.config.js` — even when tests are
written in plain JavaScript. Without this file, `ts-node` walks up the directory
tree and picks up the root `tsconfig.json`, which extends a base that sets
`"module": "preserve"`. TypeScript 6's `ts-node` cannot cleanly handle that
combination and falls back to `moduleResolution=node10`, triggering TS5107.

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "allowJs": true,
    "skipLibCheck": true,
    "ignoreDeprecations": "6.0"
  }
}
```

This file acts as a fence: `ts-node` stops walking up when it finds it and uses
these minimal, compatible settings instead of inheriting the root project's
config. It has no effect on test code.

`"moduleResolution": "node16"` is not used here because TypeScript rejects the
combination of `"module": "commonjs"` and `"moduleResolution": "node16"` —
`ts-node` would fall back to defaults and land back on `node10`.
`ignoreDeprecations: "6.0"` is the correct suppressor for TS5107 and is exactly
what the error message prescribes.

---

## 4. Config files — CJS to ESM

Because the package now has `"type": "module"`, Node.js treats every `.js` file
as ESM. All tooling config files that use `require()` / `module.exports` must be
converted.

### 4a. `jest.config.js`

Update to ESM syntax and use the `.mjs` extension for the elsie base config
import:

```diff
- const baseConfig = require('@adobe-commerce/elsie/config/jest');
+ import baseConfig from '@adobe-commerce/elsie/config/jest.mjs';

- module.exports = {
+ export default {
    ...baseConfig,
    // any package-specific overrides
  };
```

If the file uses other `require()` calls (e.g. to load local helpers or JSON),
convert those to `import` declarations as well:

```diff
- const path = require('path');
+ import path from 'path';
```

### 4b. `lighthouserc.js` → `lighthouserc.json` (if present)

Lighthouse CI does not support ESM. Instead of converting the syntax, **rename
the file to `lighthouserc.json`** and replace the CJS wrapper with a plain JSON
object:

```diff
- module.exports = {
-   ci: {
-     collect: { /* ... */ },
-     assert: { /* ... */ },
-     upload: { /* ... */ },
-   },
- };
```

```json
{
  "ci": {
    "collect": {},
    "assert": {},
    "upload": {}
  }
}
```

**Delete** `lighthouserc.js` after creating `lighthouserc.json`.

---

## 5. `.elsie.js` config → `"elsie"` key in `package.json`

The dropin config is no longer a separate file at all. Move the v1
`.elsie.js`/`.elsie.cjs` content into a new `"elsie"` key in `package.json`:

```diff
  {
    "name": "your-dropin",
    "type": "module",
+   "elsie": {
+     "name": "YourDropin",
+     "api": {
+       "root": "./src/api",
+       "importAliasRoot": "@/your-dropin/api"
+     },
+     "components": [
+       {
+         "id": "Components",
+         "root": "./src/components",
+         "importAliasRoot": "@/your-dropin/components",
+         "cssPrefix": "your-dropin",
+         "default": true
+       }
+     ],
+     "containers": {
+       "root": "./src/containers",
+       "importAliasRoot": "@/your-dropin/containers"
+     },
+     "schema": {
+       "endpoint": null,
+       "headers": {}
+     }
+   },
    ...
  }
```

Then **delete** the old `.elsie.js`/`.elsie.cjs` file.

The config is validated against
`@adobe-commerce/elsie-toolchain/schemas/elsie-config.json` (a JSON Schema
draft-07 document, checked with `ajv`) — `elsie generate api`/`component`/
`container` all report validation errors against this schema, replacing the old
ad-hoc field-by-field checks.

`schema.endpoint` can be a literal string, or `null`/omitted to fall back to the
`ENDPOINT` environment variable at the point of use (e.g. set in a `.env` file)
— this is what makes a pure-JSON config viable, since JSON can't express a
dynamic `process.env.ENDPOINT` reference the way the old
`.elsie.js`/`.elsie.cjs` files could.

---

## 6. Storybook

### 6a. `.storybook/main.js` — framework, addons, and reading the "elsie" config

```diff
- import { name } from '../.elsie';
+ import { createRequire } from 'module';
+
+ const require = createRequire(import.meta.url);
+ const { name } = require('../package.json').elsie;

- export const framework = '@storybook/preact-webpack5';
+ export const framework = '@storybook/preact-vite';

  export const addons = [
-   '@storybook/addon-essentials',
    '@storybook/addon-a11y',
-   '@storybook/addon-interactions',
    '@storybook/addon-coverage',
+   '@storybook/addon-docs',
    '@adobe-commerce/elsie/config/storybook/addon',
    '@adobe-commerce/elsie/storybook-stories',
  ];
```

`@storybook/addon-essentials` and `@storybook/addon-interactions` no longer
exist as installable packages in Storybook 10 — their functionality is bundled
into Storybook core. Remove them from `addons`.

### 6b. `.storybook/preview.js` → `preview.jsx`

Rename the file to `.storybook/preview.jsx`, then update the
`@storybook/addon-docs` import:

```diff
- import { DocsPage, DocsContainer } from '@storybook/addon-docs';
+ import { DocsContainer, DocsPage } from '@storybook/addon-docs/blocks';
```

### 6c. Story files (`.stories.tsx`)

Two import paths changed:

```diff
- import type { Meta, StoryObj } from '@storybook/preact';
+ import type { Meta, StoryObj } from '@storybook/preact-vite';

- import { action } from '@storybook/addon-actions';
+ import { action } from 'storybook/actions';
```

Run this replacement across all story files:

```bash
# Meta/StoryObj types
find src -name '*.stories.tsx' | xargs sed -i '' \
  "s|from '@storybook/preact'|from '@storybook/preact-vite'|g"

# action helper
find src -name '*.stories.tsx' | xargs sed -i '' \
  "s|from '@storybook/addon-actions'|from 'storybook/actions'|g"
```

### 6d. MDX files

```diff
- import { Meta } from '@storybook/blocks';
+ import { Meta } from '@storybook/addon-docs/blocks';
```

Run across all MDX files:

```bash
find src -name '*.mdx' | xargs sed -i '' \
  "s|from '@storybook/blocks'|from '@storybook/addon-docs/blocks'|g"
```

### 6e. `storybook-stories.js` (if present)

Convert from CommonJS to ESM:

```diff
- const path = require('path');
- const { name } = require('./.elsie');
-
- module.exports = {
+ import { createRequire } from 'module';
+
+ const require = createRequire(import.meta.url);
+ const { name } = require('./package.json').elsie;
+
+ export default {
    stories: [
      {
-       directory: path.resolve(__dirname, './src'),
-       titlePrefix: name,
+       directory: './src',
+       titlePrefix: name,
        files: '**/*.(mdx|stories.@(js|jsx|ts|tsx))',
      },
    ],
  };
```

### 6f. `.gitignore` — add `storybook-static`

```
storybook-static
```

---

## 7. TypeScript

### 7a. Replace `baseUrl` with `rootDir` in `tsconfig.json`

```diff
  "compilerOptions": {
-   "baseUrl": ".",
+   "rootDir": "./src",
  }
```

`baseUrl` is deprecated in TypeScript 6. `paths` aliases now resolve relative to
the tsconfig file without needing an explicit `baseUrl`.

### 7b. Add explicit `types` to `tsconfig.json`

`@adobe-commerce/elsie/config/tsconfig-base.json` sets `"types": []` to prevent
test types from leaking into build declaration output. You must add an explicit
`types` array to your package's `tsconfig.json` so that ambient globals
(`describe`, `expect`, `process`, etc.) are available during development and
type-checking.

**Preact packages** extend `tsconfig-preact.json`, which already declares
`"types": ["jest", "vite/client"]`. No further action is needed unless your
package also needs Node.js globals:

```diff
  "compilerOptions": {
+   "types": ["jest", "vite/client", "node"]
  }
```

**Non-Preact packages** (extending `tsconfig-base.json` directly) must add
`jest` at minimum:

```diff
  "compilerOptions": {
+   "types": ["jest"]
  }
```

Add `"node"` if the package uses Node.js globals (`process`, `__dirname`, etc.):

```diff
+   "types": ["jest", "node"]
```

Any package-specific ambient type packages (e.g. `"grecaptcha"`) go here too.

### 7c. Add `tsconfig.build.json`

The `dtsPlugin` defaults to looking for `tsconfig.build.json` in the package
root. This file must exist. A minimal example that extends the base config:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "declaration": true,
    "declarationMap": false,
    "emitDeclarationOnly": true,
    "noCheck": true,
    "types": [],
    "rootDir": "src"
  },
  "include": ["src"],
  "exclude": ["**/*.test.*", "**/*.stories.*", "node_modules"]
}
```

`types: []` keeps test types out of the emitted declarations. Use your own
`declarationDir` if needed; the plugin overrides it via CLI so the file itself
does not need to define it.

---

## 8. Test files

### 8a. Replace direct `window.location` assignments with a navigation utility

Jest 30 / jsdom 25 disallows overwriting `window.location`. Rather than patching
tests with the History API workaround, introduce a thin utility that all call
sites can share — then mock the utility in tests.

**Create `src/lib/navigation.ts`:**

```ts
export const navigate = (url: string): void => {
  window.location.href = url;
};
```

**Replace every direct assignment in source files:**

```diff
- window.location.href = url;
+ import { navigate } from '../lib/navigation';
  // ...
+ navigate(url);
```

> If your package has a path alias configured (e.g.
> `@adobe-commerce/<your-pkg>/*` → `src/*` in `tsconfig.json`), prefer the alias
> over the relative path:
>
> ```ts
> import { navigate } from '@adobe-commerce/<your-pkg>/lib/navigation';
> ```

**Update tests to mock the utility instead of touching `window.location`:**

```diff
+ import * as navigation from '../lib/navigation'; // or alias: '@adobe-commerce/<your-pkg>/lib/navigation'
+
+ beforeEach(() => {
+   jest.spyOn(navigation, 'navigate').mockImplementation(() => {});
+ });
+
+ afterEach(() => {
+   jest.restoreAllMocks();
+ });

- delete (window as any).location;
- (window as any).location = { href: '' };

  // in assertions:
- expect(window.location.href).toBe('#checkout');
+ expect(navigation.navigate).toHaveBeenCalledWith('#checkout');
```

This keeps tests simple (no jsdom URL normalisation to reason about) and makes
navigation intent explicit in both source and test code.

---

## 9. Snapshots

jsdom 25 (bundled with Jest 30) renders some DOM structures differently from
jsdom 20. Existing `.snap` files may no longer match and will cause test
failures that are not real regressions.

Run the suite once to see what fails:

```bash
yarn test
# npm
npm test
```

If snapshot failures are the only failures and the diffs look like expected
rendering differences (whitespace, attribute ordering, self-closing tags),
regenerate them:

```bash
yarn test --updateSnapshot
# npm  (note the extra -- to forward the flag)
npm test -- --updateSnapshot
```

Review every updated snapshot in the diff before committing. Look for:

- Unintended changes to component output (a real regression hiding behind a
  snapshot update)
- New snapshots that should be assertions instead

If a snapshot failure is accompanied by a JS error, fix the underlying code
issue before updating.

---

## 10. Verification checklist

After all changes:

```bash
# yarn
yarn install
yarn lint             # 0 errors
yarn test             # all tests pass
yarn storybook        # dev server starts, SVGs render, stories load
yarn build:storybook  # static build exits 0

# npm
npm install
npm run lint
npm test
npm run storybook
npm run build:storybook
```
