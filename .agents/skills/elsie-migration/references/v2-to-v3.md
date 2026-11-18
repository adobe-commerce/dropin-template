# Migrating to elsie v3

This playbook covers every change a consumer package must make to stay
compatible with `@adobe-commerce/elsie@3.0`, plus the package-manager move to
pnpm that shipped alongside it. It applies to repos that consume
`@adobe-commerce/elsie` as their **development toolchain** (CLI, shared
ESLint/Jest/Vite/TypeScript/Prettier configs, test-kit) — the drop-in package
repos. `@dropins/tools`'s runtime bundle (components, build tools, and the
re-exposed `event-bus`/`fetch-graphql`) is unaffected by sections 1–8; if your
package only consumes that bundle, skip to section 9 (pnpm) and section 10
(reCAPTCHA), which apply regardless.

> **Which package manager?** Commands below are shown for yarn, npm, and pnpm
> where they differ.
>
> | Action                  | yarn                   | npm                            | pnpm                   |
> | ----------------------- | ---------------------- | ------------------------------ | ---------------------- |
> | Install deps            | `yarn install`         | `npm install`                  | `pnpm install`         |
> | Add a dev dep           | `yarn add -D <pkg>`    | `npm install --save-dev <pkg>` | `pnpm add -D <pkg>`    |
> | Run a script            | `yarn <script>`        | `npm run <script>`             | `pnpm <script>`        |
> | Run a script with flags | `yarn <script> --flag` | `npm run <script> -- --flag`   | `pnpm <script> --flag` |
> | Run a local/one-off bin | `yarn <bin>`           | `npx <bin>`                    | `pnpm exec`/`pnpm dlx` |

---

## 1. Config source — multiple formats now supported, `.elsierc.json` is the default

Elsie now resolves the dropin config via `cosmiconfig`, searching (in this
order, project root only) `.elsierc` → `.elsierc.json` → `elsie.config.json` →
`elsie.config.js` → `elsie.config.mjs` → the `"elsie"` key in `package.json`
(kept last, as a backward-compatible fallback — still read, not deprecated).

- If your package still has a v1-era standalone `.elsie.js`/`.elsie.cjs` file
  (predating even the v1→v2 migration to the `package.json` key), move it —
  neither of those filenames is in the search list above, so it's silently
  ignored.
- If you're on the `"elsie"` `package.json` key from the v1→v2 migration, it
  still works with no changes required, but consider moving to a standalone
  `.elsierc.json` — that's what `elsie generate config` now scaffolds, and what
  elsie's own package (`packages/elsie/.elsierc.json`) uses.

```diff
- {
+ // .elsierc.json
+ {
+   "name": "YourDropin",
+   "api": { "root": "./src/api", "importAliasRoot": "@/your-dropin/api" },
+   "components": [{ "id": "Components", "root": "./src/components", "importAliasRoot": "@/your-dropin/components", "cssPrefix": "your-dropin", "default": true }],
+   "containers": { "root": "./src/containers", "importAliasRoot": "@/your-dropin/containers" },
+   "schema": { "endpoint": null, "headers": {} }
+ }
```

```diff
  // package.json — only needed if you're moving off the "elsie" key
  {
    "name": "your-dropin",
    "type": "module",
-   "elsie": {
-     "name": "YourDropin",
-     "api": { "root": "./src/api", "importAliasRoot": "@/your-dropin/api" },
-     "components": [{ "id": "Components", "root": "./src/components", "importAliasRoot": "@/your-dropin/components", "cssPrefix": "your-dropin", "default": true }],
-     "containers": { "root": "./src/containers", "importAliasRoot": "@/your-dropin/containers" },
-     "schema": { "endpoint": null, "headers": {} }
-   },
    ...
  }
```

The config is validated against the same
`@adobe-commerce/elsie/schemas/elsie-config.json` schema regardless of which
format you pick.

---

## 2. `config/` → `configs/` (plural) path relocation

Every shared-config subpath moved from `config/` to `configs/`. Update every
reference:

| Old (v2)                                            | New (v3)                                                                     |
| --------------------------------------------------- | ---------------------------------------------------------------------------- |
| `@adobe-commerce/elsie/config/tsconfig-base.json`   | `@adobe-commerce/elsie/configs/tsconfig/base.json`                           |
| `@adobe-commerce/elsie/config/tsconfig-preact.json` | `@adobe-commerce/elsie/configs/tsconfig/preact.json`                         |
| `@adobe-commerce/elsie/config/prettier.json`        | `@adobe-commerce/elsie/configs/prettier.js`                                  |
| `@adobe-commerce/elsie/config/jest.mjs`             | `@adobe-commerce/elsie/configs/jest.js`                                      |
| `@adobe-commerce/elsie/config/eslint.mjs`           | `@adobe-commerce/elsie/configs/eslint.js`                                    |
| `@adobe-commerce/elsie/config/vite.mjs`             | `@adobe-commerce/elsie/configs/vite.js`                                      |
| `@adobe-commerce/elsie/lib/tests`                   | `@adobe-commerce/elsie/tests/preact` (provider-backed render; see section 6) |

The `"prettier"` key in `package.json` is a plain string, so it's a one-line
edit:

```diff
- "prettier": "@adobe-commerce/elsie/config/prettier.json",
+ "prettier": "@adobe-commerce/elsie/configs/prettier.js",
```

Add the formatting scripts to your `package.json` (or update them if they
already exist) to use elsie's formatter, as in the SDK's root `package.json`:

```diff
  "scripts": {
+   "format": "elsie format",
+   "format:check": "elsie format --check",
    ...
  }
```

Use `format` to apply formatting and `format:check` to verify it in CI.

### Automatically format staged files with a native pre-commit hook

If you want commits to automatically fix formatting drift, use Git's native
`core.hooksPath` mechanism (as this repository does) rather than adding a hook
manager dependency. Add a tracked `.githooks/pre-commit` script:

```sh
#!/usr/bin/env sh

staged_files=$(git diff --cached --name-only --diff-filter=ACMR | grep -E '\.(js|jsx|mjs|cjs|ts|tsx|json|css|scss|md|mdx|ya?ml|html)$')

if [ -n "$staged_files" ]; then
  # Use the package manager and format script configured above.
  pnpm run format -- $staged_files
  printf '%s\n' "$staged_files" | xargs git add
fi
```

Use the equivalent script invocation for your package manager: `yarn format --`
or `npm run format --` in place of `pnpm run format --`. Keep the filename
filter aligned with the file types your formatter supports. The hook formats
only added, copied, modified, or renamed staged files, then re-stages the
formatted versions so the commit contains the changes. It does not format
unstaged-only files. This intentionally covers formatting only; do not add the
repository-specific `tokens:sync` operation from this repo's hook.

Make the hook executable and configure Git to use the versioned hooks directory
from your package's `prepare` script:

```bash
chmod +x .githooks/pre-commit
```

```json
{
  "scripts": {
    "prepare": "git config core.hooksPath .githooks"
  }
}
```

If `prepare` already exists, append the `git config` command without replacing
its current setup. `prepare` runs after dependency installation, installing the
hook path for fresh clones; existing clones can run the command once manually.
No hook runs until `.githooks/pre-commit` is executable and Git's
`core.hooksPath` points to `.githooks`. Contributors can bypass the hook for a
single commit with `git commit --no-verify`.

Create a `.prettierignore` at the package root with `package.json` in it by
default:

```gitignore
package.json
```

This keeps the formatter from rewriting the package manifest. Elsie's `format`
command combines this local file with its bundled ignore rules, so you only need
to list additional package-specific exclusions here.

---

## 3. `elsie types` removed — use `tsc` directly

The `elsie types` command (`tsc --noEmit` plus TS6 tsconfig validation) is gone.
Replace it with a plain script using your own installed `typescript`:

```diff
- "type-check": "elsie types",
+ "type-check": "tsc --noEmit",
```

Audit every script/CI step that called `elsie types` — the old command simply no
longer exists, so a stale reference fails loudly rather than silently passing.

This is tied to section 7 below: `typescript` is no longer bundled inside elsie,
so this script now runs against **your package's own** `typescript` install.

---

## 4. ESLint config factory replaced — compose from layers, not `createConfig()`

The `createConfig()` / `browser` / `node` exports of
`@adobe-commerce/elsie/configs/eslint.js` are gone (the `restrictions` export
subpath is also gone — folded into the same entry point, see below). Compose
your flat config from named layers instead:

```diff
- import { createConfig } from '@adobe-commerce/elsie/config/eslint.mjs';
- export default createConfig({ runtime: 'browser' });
+ import {
+   defineConfig,
+   globals,
+   typescript,
+   tests,
+ } from '@adobe-commerce/elsie/configs/eslint.js';
+ export default defineConfig(globals('browser'), typescript(), tests());
```

- `defineConfig(...layers)` always keeps the shared base first and prettier
  last.
- `globals(env, files?)` accepts one environment name or an array, such as
  `globals('browser')` or `globals(['browser', 'node'])`. The optional `files`
  scope applies to every environment in that call; omit it to apply everywhere.
  Globals merge in array order, with later environments taking precedence on
  overlaps. Omit the globals layer entirely for `runtime: 'agnostic'`.
- The rest of the old presets map over directly as layers: `typescript()`,
  `tests()`, `preact()`, `storybook()`.
- **`restrictions` moved here too** — it no longer has its own export subpath
  (`@adobe-commerce/elsie/configs/eslint/restrictions.js` is gone):

  ```diff
  - import { restrictions } from '@adobe-commerce/elsie/configs/eslint/restrictions.js';
  + import { defineConfig, typescript, restrictions } from '@adobe-commerce/elsie/configs/eslint.js';

    export default defineConfig(typescript(), restrictions());
  ```

One config can now scope different folders to different runtimes just by passing
different `files` to each layer — something the old single
`createConfig({ runtime })` call couldn't express.

```js
export default defineConfig(
  globals('browser', ['src/**']),
  globals('node', ['scripts/**', '*.config.js']),
  typescript(),
  tests(),
);
```

Use a single `globals(['browser', 'node'], ['shared/**'])` call when both
environments share a file scope. Separate calls remain supported and are needed
for different scopes.

If the package has a Cypress suite, import the opt-in `cypress()` preset from
Elsie instead of importing `eslint-plugin-cypress` directly:

```diff
- import cypress from 'eslint-plugin-cypress';
+ import { cypress } from '@adobe-commerce/elsie/configs/eslint.js';

  export default defineConfig(
    // ...other layers
-   { ...cypress.configs.recommended, files: ['cypress/**/*.js'] },
+   cypress(),
  );
```

Replace the old `createConfig({ cypress: true })` option with the `cypress()`
layer too. It supplies Cypress's recommended rules and browser, Mocha, and
Cypress globals for JS/TS files under `cypress/`. Use
`cypress({ files: ['e2e/**/*.{js,ts}'] })` for another directory, and compose
with `typescript()` for TypeScript tests. Remove `eslint-plugin-cypress` from
your dependencies once your ESLint config uses Elsie's preset; Elsie bundles the
plugin. Update your lockfile after removing the dependency.

Preserve existing suite-specific rule overrides by passing them to the preset
instead of keeping a separate config object with the same file scope:

```js
cypress({
  files: ['cypress/**/*.js'],
  rules: {
    'cypress/no-unnecessary-waiting': 'off',
  },
});
```

The `rules` option adds to or overrides the recommended rules; unspecified rules
remain enabled. Keep overrides with different file scopes as separate config
layers.

After updating, run the linter and fix anything newly surfaced:

```bash
pnpm lint   # or: yarn lint / npm run lint
```

---

## 5. Jest config factory renamed, `environment` → `preset`

```diff
- import baseConfig from '@adobe-commerce/elsie/config/jest.mjs';
- export default { ...baseConfig(), environment: 'jsdom' };
+ import { defineConfig } from '@adobe-commerce/elsie/configs/jest.js';
+ export default defineConfig({ preset: 'preact' });
```

`environment: 'node' | 'jsdom'` is replaced by a three-value `preset`:

| `preset`           | What it sets up                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `'node'` (default) | Node environment, no DOM.                                                                                                                                                                                   |
| `'dom'`            | jsdom + browser-API shims, no preact/compat aliasing or asset mocks — for DOM-only tests.                                                                                                                   |
| `'preact'`         | Everything `'dom'` sets up, plus preact/compat aliasing and css/svg asset mocks — for component tests. The shared config supplies `testEnvironmentOptions.customExportConditions: ['node', 'node-addons']`. |

Match the `preset` to which test-kit tier you import (section 6) — `'preact'`
pairs with `@adobe-commerce/elsie/tests/preact`, `'dom'` with `/tests/dom`,
`'node'` with the base `/tests`.

Keep the test script routed through Elsie's CLI so consumers do not need their
own Jest installation:

```json
{
  "scripts": {
    "test": "elsie test --config jest.config.js"
  }
}
```

The shared config installs the Babel import rewrite and resolves `@jest/globals`
from Elsie's dependencies. Preserve its `transform` and `moduleNameMapper`
entries when applying overrides; replacing either object wholesale can remove
mock hoisting or isolated-linker dependency resolution.

---

## 6. Test-kit — explicit imports replace ambient jest globals

Tests now import their jest API explicitly instead of relying on ambient
`@types/jest` globals (matching Jest's own recommendation — `@jest/globals`
ships version-matched with jest; `@types/jest` is third-party and can drift).

Three tiers, each a superset of the previous — import exactly what a given test
needs:

- **`@adobe-commerce/elsie/tests`** — base tier. `jest`/`describe`/`it`/`test`/
  `expect` + lifecycle hooks (re-exported from `@jest/globals`), plus
  `mockResolvedFn`/`mockRejectedFn`. No DOM code — use it in Node tests.
- **`@adobe-commerce/elsie/tests/dom`** — adds jest-dom matchers (registered
  against jsdom) for tests that assert on the DOM but render no components.
- **`@adobe-commerce/elsie/tests/preact`** — adds `@testing-library/preact` and
  `userEvent` on top of `/tests/dom`, for component tests. Its `render` supplies
  `UIProvider` and `.dropin-design`, loading the consuming package's
  `src/i18n/en_US.json` when first called. Run tests from the package root.
  Remove local provider-backed render helpers and import directly from this tier
  so named `jest` imports benefit from mock hoisting. Override `lang` and
  `langDefinitions` via render options when needed; use `renderPreact` for
  unwrapped rendering.

These are test-runtime entry points. Do not import them in `jest.config.js` or
other configuration files executed outside Jest's test environment. Import the
config factory from `@adobe-commerce/elsie/configs/jest.js` instead.

```diff
- describe('MyComponent', () => {
-   it('renders', () => {
-     expect(...).toBe(...);
-   });
- });
+ import { describe, it, expect } from '@adobe-commerce/elsie/tests/preact';
+
+ describe('MyComponent', () => {
+   it('renders', () => {
+     expect(...).toBe(...);
+   });
+ });
```

Then:

1. Drop `@types/jest` from `devDependencies` — it's no longer required, and the
   shared tsconfig no longer sets `types: ["jest"]`.
2. Remove `"jest"` from your own `tsconfig.json`'s `types` array if you added it
   per the v1→v2 playbook (step 7b there) — it's no longer needed once you
   import from the test-kit instead of relying on the ambient global.
3. Import named `jest` from the test-kit in every test or setup file that uses
   its runtime API or types such as `jest.Mock`. The shared tsconfigs no longer
   declare ambient Jest globals. The shared Jest config rewrites these imports
   before Babel's mock hoisting and resolves `@jest/globals` through Elsie's own
   dependencies, including with pnpm's isolated linker:

   ```ts
   import { jest } from '@adobe-commerce/elsie/tests';

   jest.mock('./some-module', () => ({ ... }));
   ```

`@jest/globals` and `@testing-library/user-event` are now real dependencies of
elsie, so they don't need to be added separately. Consumer imports should go
through Elsie's public test tiers, rather than depending on direct access to
transitive packages such as `@jest/globals` under pnpm's isolated linker.

### 6.1 Direct imports preserve mock hoisting

Import named `jest` directly from `/tests`, `/tests/dom`, or `/tests/preact`.
Aliases such as `jest as jestApi` are supported. The shared Babel plugin moves
only that runtime import to `@jest/globals` before Jest checks mock factories;
other helpers remain imported from Elsie. This also supports Jest references in
nested mock factories.

The rewrite does not follow local barrels or the legacy `/lib/tests` entry
point, and does not rewrite namespace access such as `tests.jest.mock()`.
Replace imports from local test helpers with the public tier:

```diff
- import { jest, render, screen, expect, test } from '../tests';
+ import { jest, render, screen, expect, test } from '@adobe-commerce/elsie/tests/preact';
```

### 6.2 Replace local provider-backed render helpers

The wrapper many packages maintained locally is now built into `/tests/preact`.
Replace imports from `@adobe-commerce/elsie/lib/tests` or your local helper with
direct imports from `/tests/preact`. The legacy entry point remains a
compatibility re-export, but new imports should use the public tier.

```tsx
import {
  jest,
  render,
  screen,
  expect,
  test,
} from '@adobe-commerce/elsie/tests/preact';
import { MyComponent } from './MyComponent';

test('renders', () => {
  const onChange = jest.fn();
  render(<MyComponent onChange={onChange} />);
  expect(screen.getByRole('button')).toBeVisible();
});
```

Default `render` behavior:

- Loads `<working directory>/src/i18n/en_US.json` on first render and caches it
  by absolute path in the test module environment. Run `elsie test` from the
  package root; setting Jest's `rootDir` does not change the working directory.
- Supplies `UIProvider` with `lang: 'en_US'` and the package's definitions, plus
  the `.dropin-design` wrapper. Elsie's default translations are merged by the
  provider.
- Retains the provider and design wrapper on `rerender`. A custom `wrapper`
  option is composed inside the design wrapper.

No local JSON import or filesystem loader is needed for the default convention.
Remove duplicated provider wrappers once callers are migrated, preserving any
unrelated helpers your local module also contains.

For another language or test-specific definitions, pass both through render
options. Providing `langDefinitions` skips filesystem loading; changing `lang`
alone does not automatically load a different JSON file:

```tsx
render(<MyComponent />, {
  lang: 'fr_FR',
  langDefinitions: { fr_FR: { MyDropin: { label: 'Bonjour' } } },
});
```

Use `renderPreact` when the test needs no provider/design wrapper, supplies its
own complete provider setup, or mocks provider dependencies such as the entire
Elsie i18n module. This preserves the old raw `/tests/preact` render behavior:

```diff
- import { render } from '@adobe-commerce/elsie/tests/preact';
+ import { renderPreact as render } from '@adobe-commerce/elsie/tests/preact';
```

### 6.3 Use Jest 30's function-based mock types

The named `jest` import includes `jest.Mock`, `jest.MockedFunction`, and other
bundled types; no separate `Jest` type import or ambient declaration is needed.
Jest 30's `jest.Mock` takes a function signature, rather than the legacy
`@types/jest` return-type/argument-tuple generics:

```ts
import { jest, beforeEach } from '@adobe-commerce/elsie/tests';
import { estimateShipping } from './estimateShipping';

jest.mock('./estimateShipping');
const mockEstimateShipping = jest.mocked(estimateShipping);

beforeEach(() => {
  // Assuming estimateShipping returns a promise that can resolve to null.
  mockEstimateShipping.mockReset().mockResolvedValueOnce(null);
});
```

For standalone async mocks, type the return value or use Elsie's inference
helpers. Bare `jest.fn()`/`jest.Mock` defaults to an unknown return type, which
makes `mockResolvedValue`/`mockRejectedValue` accept `never`:

```ts
import {
  jest,
  mockResolvedFn,
  mockRejectedFn,
} from '@adobe-commerce/elsie/tests';

const mockShipping = jest.fn<() => Promise<null>>();
mockShipping.mockResolvedValueOnce(null);
const mockResolved = mockResolvedFn(null);
const mockRejected = mockRejectedFn(new Error('Failed'));
```

Pass the resolved value to `mockResolvedValueOnce`, not
`Promise.resolve(value)`. Replace legacy `jest.SpyInstance` annotations with a
corresponding `jest.SpiedFunction<typeof originalFunction>` or let
`jest.spyOn()` infer the type.

---

## 7. `typescript` is now a peer dependency

`typescript` moved from a bundled `dependency` to an optional `peerDependency`
(`>=6.0.0`) of `@adobe-commerce/elsie`. The `dts` Vite plugin (used by
`elsie build` for `.d.ts` generation) now resolves `typescript` from **your
package's own install**, so declaration output reflects the exact compiler
version your `tsconfig.json`, source, and IDE actually use.

Add your own `typescript` devDependency if you don't already have one (the v1→v2
playbook's `^6.0.0` minimum still applies):

```bash
pnpm add -D typescript@^6.0.0
# yarn: yarn add -D typescript@^6.0.0
# npm:  npm install --save-dev typescript@^6.0.0
```

A package with no `typescript` devDependency of its own now gets a clear
`Cannot find "typescript". Add it as a devDependency of this package.` error at
build time instead of a silently mismatched build.

### `preact` / `@preact/signals` — same principle, check your versions

`preact` and `@preact/signals` are also optional `peerDependencies`, for the
same reason: your component tree must share a single Preact instance with
whatever it renders alongside, so elsie lets you bring your own copy rather than
bundling one. elsie v3 bumps the version it's built/typed against to
`preact ~10.29.7` / `@preact/signals ^2.3.1` — bump your own installs to match:

```bash
pnpm add preact@~10.29.7 @preact/signals@^2.3.1
```

Two concrete reasons this isn't optional in practice:

- **Typings.** Preact 10.29 narrowed its generic `HTMLAttributes<Target>`
  typings (`value`, `checked`, `alt`, `width`, `height`, `loading`, `srcSet`,
  `required`, `name` moved to per-element interfaces). elsie v3's component
  typings assume this; an older `preact` in your own tree can produce type
  errors elsie's declarations don't expect.
- **Signals/preact skew.** `@preact/signals` hooks into preact's internal
  `options` API — a version skew between the two drives an infinite re-render
  loop. `@preact/signals@2` requires `preact >= 10.25`; keep them in lockstep.

---

## 8. Storybook — shared config and `elsie storybook` modes

### 8.1 Move the common framework and addons to elsie

Replace the repeated framework/addon list in `.storybook/main.js` with elsie's
shared factory. Keep the package-specific `stories` (including `titlePrefix`),
`staticDirs`, and any other settings in the consuming package:

```diff
  // .storybook/main.js — use main.mjs if package.json is not "type": "module"
  import config from '../elsie.config.js';
+ import { createConfig } from '@adobe-commerce/elsie/storybook/config';

- export const stories = [{ directory: '../src', titlePrefix: config.name }];
- export const framework = '@storybook/preact-vite';
- export const addons = [
-   '@storybook/addon-a11y',
-   '@storybook/addon-coverage',
-   '@storybook/addon-docs',
-   '@adobe-commerce/elsie/configs/storybook/addon',
- ];
- export const staticDirs = ['./public'];
+ export default createConfig({
+   stories: [{ directory: '../src', titlePrefix: config.name }],
+   staticDirs: ['./public'],
+ });
```

Adjust the config import to your package's actual config source (section 1), or
provide a literal `titlePrefix` if you don't read the name from a JS file.
Storybook still interprets relative story/static paths from the consumer's
`.storybook` directory. `createConfig` resolves the Preact/Vite framework, the
a11y/coverage/docs addons, and elsie's addon from elsie's own dependencies, so
they need not be separately installed just to configure Storybook. Pass
package-specific addons as `createConfig({ addons: ['your-addon', ...], ... })`
to append them; preserve any other settings you already have as overrides.

Move Storybook imports to Elsie's focused subpaths. `/storybook/types` exports
Preact `Meta`, `StoryObj`, and `Decorator` types; `/storybook/decorators`
provides shared decorators; `/storybook/tests` exports browser play helpers
(`expect`, `userEvent`, `within`, `waitFor`, `fireEvent`, and `fn`) separately
from the `/tests` Jest kit:

```diff
- import type { Meta, StoryObj } from '@storybook/preact-vite';
- import { expect, userEvent, within } from 'storybook/test';
+ import type { Meta, StoryObj } from '@adobe-commerce/elsie/storybook/types';
+ import { expect, userEvent, within } from '@adobe-commerce/elsie/storybook/tests';
```

Move `action` imports from `storybook/actions` to
`@adobe-commerce/elsie/storybook/actions` as well.

Replace duplicated local `withMinWidth` decorators as well. Elsie's version uses
`parameters.minWidth` and defaults to `350px`:

```diff
- import { withMinWidth, withMockData } from '../../../.storybook/decorators';
+ import { withMinWidth } from '@adobe-commerce/elsie/storybook/decorators';
+ import { withMockData } from '../../../.storybook/decorators';
```

Remove the local `withMinWidth` definition when nothing else uses it. Retain
other package-specific decorators such as `withMockData`.

In `.storybook/preview.*` and other consumer files, move imports of Docs blocks
(including `DocsContainer` and `DocsPage`) to Elsie's shared subpath:

```diff
- import { DocsContainer, DocsPage } from '@storybook/addon-docs/blocks';
+ import { DocsContainer, DocsPage } from '@adobe-commerce/elsie/storybook/blocks';
```

This entry re-exports the Docs blocks; other directly imported Storybook
packages still need to remain direct dependencies until migrated.

TypeScript resolves these subpaths through Elsie's `package.json` exports, even
when an existing `"@adobe-commerce/elsie/*"` path maps source imports to
`src/*`. No additional Storybook paths are needed in your tsconfig. Vite's
shared Storybook addon handles browser-side resolution when bundling stories.

Once these imports have moved, remove `storybook`, `@storybook/addon-a11y`,
`@storybook/addon-coverage`, `@storybook/addon-docs`, and
`@storybook/preact-vite` from `devDependencies` **only if** the package no
longer imports them directly. Search stories, `.storybook/preview.*`,
`.storybook/test-runner.*`, MDX, and source; keep a direct dependency for any
remaining `storybook/*` or `@storybook/*` import that does not go through the
shared entry (TypeScript cannot resolve phantom dependencies with pnpm's
isolated linker). Update the lockfile after editing `package.json`.

For a package with no direct imports of these packages, remove the entries from
`package.json` (and regenerate its lockfile):

```diff
  "devDependencies": {
    "@adobe-commerce/elsie": "...",
-   "storybook": "...",
-   "@storybook/preact-vite": "...",
-   "@storybook/addon-a11y": "...",
-   "@storybook/addon-coverage": "...",
-   "@storybook/addon-docs": "..."
  }
```

### 8.2 Share the a11y test-runner config

If `.storybook/test-runner.ts` duplicates Elsie's a11y hooks, replace the hooks
with a named import of the shared config, retaining the file's copyright header.
Storybook's test runner still looks for a **default export** in each consumer's
`.storybook` directory, while the hooks and their dependencies live in Elsie:

```ts
// .storybook/test-runner.ts (or .mjs if your package is not ESM)
import { a11yTestRunnerConfig } from '@adobe-commerce/elsie/storybook/test-runner';

export default a11yTestRunnerConfig;
```

The shared config injects axe before visiting each story, applies that story's
`parameters.a11y.config.rules`, checks `#storybook-root` with the HTML detailed
report, and skips stories tagged `skip`. Preserve any package-specific hooks or
settings by defining a local config that spreads the shared default and
overrides the relevant fields rather than dropping them. Once there are no other
direct imports of `@storybook/test-runner` or `axe-playwright` in your package,
remove those devDependencies and regenerate the lockfile. Use the
`elsie storybook test` command below to invoke the runner from Elsie's own
dependencies.

TypeScript resolves `@adobe-commerce/elsie/storybook/test-runner` through
Elsie's package export and bundled declaration; no custom tsconfig path or
`allowJs` setting is needed. The shared hooks are published as JavaScript, so
Storybook's default Jest configuration can load them from `node_modules`,
including pnpm's isolated layout. Your local `.storybook/test-runner.ts` can
remain TypeScript.

If an earlier alpha required a `.storybook/test-runner-jest.config.js` solely to
allow transforming Elsie's TypeScript hooks, remove that workaround after
upgrading and rerun Storybook tests. If the file contains other customizations,
retain them and remove only the Elsie-specific transformation exception.

### 8.3 Run Storybook through elsie's CLI

`elsie storybook` previously only ran `storybook dev`. It now accepts a mode
argument:

```diff
- "build:storybook": "storybook build",
- "test:storybook": "test-storybook",
+ "build:storybook": "elsie storybook build",
+ "test:storybook": "elsie storybook test",
```

Also change a bare `storybook dev` script to `elsie storybook` (or
`elsie storybook dev`). `elsie storybook [mode]` resolves the Storybook and
test-runner binaries from elsie instead of relying on the shell's `PATH`; once
you remove your direct `storybook` dependency, bare `storybook build` is not
reliable under pnpm's isolated linker. `dev` is the default, and additional
arguments pass through to Storybook or the test runner unchanged.

If CI installs Playwright browsers with
`pnpm exec playwright install --with-deps`, switch that step to Elsie's
install-only Storybook flag:

```diff
- run: pnpm exec playwright install --with-deps
+ run: pnpm exec elsie storybook --install-playwright --with-deps
```

Elsie resolves its own Playwright binary, which pnpm does not link into a
consumer's `.bin`. `--with-deps` and optional browser names are forwarded to
`playwright install`; the command exits after installation. Keep this as a
separate step before building and testing Storybook. If Playwright was a direct
devDependency solely to provide this CLI, remove it and update the lockfile.

---

## 9. Package manager — adopting pnpm (recommended, not required)

As part of this release, elsie's own monorepo migrated from Yarn to pnpm,
primarily to gain pnpm's `minimumReleaseAge` supply-chain gate (a newly
published dependency version — including transitive ones — can't be installed
until it's had time to be flagged if compromised) plus dependency build-script
allow-listing. elsie v3's toolchain does **not require** pnpm — it still works
under Yarn or npm — but this is a natural moment to make the same move in your
own package repo, and two of the fixes in this release specifically remove the
friction that used to make pnpm painful for elsie consumers:

- **Elsie's CLI no longer shells out to bare command names.** `lint`/`test`/
  `storybook`/`changeset` are resolved and spawned directly, fixing the "command
  not found" (exit 127) failure pnpm's strict linker used to cause for elsie's
  own CLI specifically (Symptom A below still applies to _other_ tools you
  depend on).
- **The shared Jest config's `transformIgnorePatterns` now matches pnpm's
  isolated-linker virtual store**, not just the flat/hoisted layout. Elsie and
  the other `@adobe-commerce/*` packages ship untranspiled TS/TSX and need to be
  allow-listed for transformation; previously the pattern only matched
  `node_modules/<pkg>`, not pnpm's real nested path
  (`node_modules/.pnpm/<scope>+<name>@<version>/node_modules/<scope>/<name>/…`),
  so every consumer test suite failed with
  `SyntaxError: Cannot use import statement outside a module` under pnpm's
  default linker. **You no longer need a hand-rolled `transformIgnorePatterns`
  override or `nodeLinker: hoisted` just to work around elsie's own packages** —
  elsie's monorepo itself runs on the default (isolated, non-hoisted) linker
  with no `nodeLinker` override.

The rest of this section is a general Yarn/npm → pnpm playbook. Anything in your
dependency tree _besides_ elsie can still hit the two symptoms described in step
9.5 — audit for that before assuming you can skip straight to the strict default
linker.

### 9.1 Prerequisites

- **pnpm ≥ 10.16.** The config file location and `minimumReleaseAge`/
  `allowBuilds` behavior below are version-sensitive — check `pnpm --version`
  first if something doesn't match.
- Node matching your repo's declared version, and `corepack` available.
- Work on a dedicated branch.

### 9.2 Discovery — audit before you touch anything

Identify the source manager: `yarn.lock` → Yarn (a `.yarnrc.yml`/`.yarn/` means
Berry); `package-lock.json`/`npm-shrinkwrap.json` → npm.

```bash
# Lockfiles & PM config, including nested sub-projects
find . -not -path '*/node_modules/*' \
  \( -name 'yarn.lock' -o -name '.yarnrc' -o -name '.yarnrc.yml' -o -name '.yarn' \
     -o -name '.npmrc' -o -name 'package-lock.json' -o -name 'npm-shrinkwrap.json' \
     -o -name 'pnpm-lock.yaml' \)

# Nested projects with their own package.json (e.g. cypress/) migrate separately — see 9.7
find . -name package.json -not -path '*/node_modules/*'

# Package-manager invocations baked into scripts / docs / Docker / CI
grep -rInE 'yarn|npm ci|npm run|npm i(nstall)?|npx' \
  --include='*.json' --include='*.md' --include='Dockerfile*' --include='*.ya?ml' \
  --exclude-dir=node_modules .
```

**Most important step: how does CI install dependencies?** If CI auto-detects
the package manager from the lockfile, check the precedence order — a common
setup checks `yarn.lock → pnpm-lock.yaml → package-lock.json`, which means:

- **From Yarn:** you _must_ delete `yarn.lock` or CI keeps using Yarn no matter
  what else changes.
- **From npm:** adding `pnpm-lock.yaml` already wins over `package-lock.json` in
  that order, but delete the npm lockfile anyway so nothing else (a bot, a
  future change to the detection order) picks it back up.

Also confirm whether the pnpm setup step in CI reads a version from the
`packageManager` field (see 9.3) or has one hardcoded, and how any nested
sub-projects are installed.

### 9.3 `package.json`

```diff
+ "packageManager": "pnpm@10.16.0",
```

Replace any existing `"yarn@…"`/`"npm@…"` value. `pnpm/action-setup` and similar
CI actions read the version from here when the workflow doesn't pass one
explicitly. Convert every `yarn …`/`npm …` invocation in `scripts` to pnpm.

### 9.4 `pnpm-workspace.yaml` — this is where pnpm config now lives

In pnpm ≥10.16, only auth/registry settings are read from `.npmrc`; every other
setting belongs here. A single-package repo can have this file with no
`packages:` key, used purely for settings:

```yaml
# Supply-chain hardening: refuse any dependency version published < minimumReleaseAge
# minutes ago (10080 = 7 days), transitive deps included. Exclude your own first-party
# scope so internal releases aren't delayed by a policy meant for the public registry.
minimumReleaseAge: 10080
minimumReleaseAgeExclude:
  - '@your-org/*'
```

Migrate any behavioral `.npmrc`/`.yarnrc.yml` settings you rely on (this matters
most coming from npm, where `.npmrc` often carries real config) — keep only
auth/registry keys in `.npmrc`:

| Old (`.npmrc` / `.yarnrc.yml`)                     | pnpm (`pnpm-workspace.yaml`)                                                                          |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `save-exact=true` / `defaultSemverRangePrefix: ""` | `savePrefix: ''`                                                                                      |
| `engine-strict=true`                               | `engineStrict: true`                                                                                  |
| `auto-install-peers=true`                          | `autoInstallPeers: true`                                                                              |
| `legacy-peer-deps=true` (npm)                      | no direct equivalent — pnpm is stricter; tune `strictPeerDependencies`/`autoInstallPeers` and re-test |
| custom `cache`/`store` dirs                        | `storeDir:`                                                                                           |

Delete keys that were no-ops or manager-specific cruft rather than carrying them
over unexamined.

Then remove old PM state: for Yarn, `.yarnrc`/`.yarnrc.yml`/`.yarn/` and any PnP
artifacts (`.pnp.cjs`, `.pnp.loader.mjs`); for npm, there's nothing extra beyond
`.npmrc` (already handled above).

### 9.5 Generate the lockfile

```bash
pnpm import                       # <old lockfile> -> pnpm-lock.yaml (auto-detected)
git rm yarn.lock                  # …OR package-lock.json (and/or npm-shrinkwrap.json)
pnpm install
```

### 9.6 Build (postinstall) scripts and the `node_modules` layout

**Both Yarn and npm run every dependency's install/postinstall script
automatically; pnpm blocks them by default**, printing
`[ERR_PNPM_IGNORED_BUILDS]`. Approve each one explicitly via `allowBuilds` in
`pnpm-workspace.yaml` (pnpm scaffolds it for you on first run):

```yaml
allowBuilds:
  '@swc/core': true # native binding your build needs
  esbuild: true # native binding your build needs
```

Then run `pnpm install` again to actually execute the approved scripts (a no-op
install won't run them), and verify a native tool works, e.g.
`pnpm exec esbuild --version`.

> Older pnpm used an `onlyBuiltDependencies`/`ignoredBuiltDependencies` list
> pair instead of the `allowBuilds` map — use whichever your installed pnpm
> actually honors.

**The `node_modules` layout decision (`nodeLinker`) is the other make-or-break
step**, independent of anything elsie itself now fixes. By default pnpm does
**not** hoist a flat `node_modules` — only a package's _direct_ dependencies are
exposed at the top level. That strictness breaks two patterns Yarn/npm's
hoisting used to paper over:

- **Symptom A — "command not found" (exit 127).** Some _other_ dependency in
  your tree spawns a bare binary it depends on transitively (e.g.
  `spawn('some-tool …', { shell: true })`). Under strict pnpm that binary isn't
  hoisted to your top-level `.bin`. Check whether a newer release of that
  specific tool already resolves its own binary path instead of relying on
  `PATH` before reaching for `hoisted`.
- **Symptom B — tool configs that pattern-match literal `node_modules/` paths.**
  elsie's own Jest config is now fixed (section 9 intro), but audit any _other_
  tool config that hard-codes `node_modules/` — Babel/SWC ignores, ESLint import
  resolvers, copy/glob build steps, Storybook, coverage `collectFrom` patterns.

If either symptom shows up from a dependency you don't control, set:

```yaml
nodeLinker: hoisted
```

This fixes both symptoms at once (flat layout, bare binaries land on `.bin`,
literal `node_modules/` paths work unchanged) at the cost of strict
phantom-dependency isolation. Document which dependency forced it and revisit
after upgrading that dependency. If nothing in your tree hits either symptom —
increasingly likely now that elsie's own CLI and Jest config are fixed — stay on
the strict default, matching what elsie's own monorepo does.

### 9.7 Nested sub-projects (e.g. a `cypress/` folder)

Give each nested `package.json` its own `pnpm-workspace.yaml` (pnpm searches
upward for the nearest one, so this keeps it an independent root):

```bash
# in the sub-project dir
pnpm import
git rm <nested>/yarn.lock          # …or <nested>/package-lock.json — run from repo root
pnpm install
```

Its `nodeLinker` decision is independent of the root's — test Symptom A/B
against its own dependency tree, don't assume it needs the same setting "for
consistency."

### 9.8 Command conversion

`npx <bin>` is overloaded: it runs a local binary if present, otherwise
downloads a one-off. Map local-dependency calls to `pnpm exec` and
download-a-one-off calls to `pnpm dlx` — conflating the two is the most common
conversion mistake.

### 9.9 Verification

```bash
pnpm install --frozen-lockfile   # same command CI runs; must exit 0, no ignored-builds warning
pnpm run lint
pnpm run test
pnpm run build

test ! -e yarn.lock && test ! -e package-lock.json && test ! -e npm-shrinkwrap.json \
  && test -e pnpm-lock.yaml && grep -q '"packageManager": "pnpm@' package.json \
  && echo "PM=pnpm ✅"
```

If you're testing whether you can drop `nodeLinker: hoisted`, do a **fully
clean** reinstall (`rm -rf node_modules` first) — `--frozen-lockfile` on top of
an existing `node_modules` can be masked by a stale flat-layout `.bin` symlink
from before the flip.

### 9.10 Rollback

Everything is on a branch:

```bash
git checkout -- .
git clean -fd pnpm-lock.yaml pnpm-workspace.yaml <nested>/pnpm-*.*
git restore --staged --worktree \
  yarn.lock .yarnrc .yarnrc.yml package-lock.json npm-shrinkwrap.json  # whichever applied

yarn install     # or: npm install
```

---

## 10. `@adobe-commerce/recaptcha` consumers — `COMPANY_CREATE` default changed

If your package consumes `@adobe-commerce/recaptcha` directly: reCAPTCHA form
types are now configurable via feature flag, and `COMPANY_CREATE` is **no longer
in the default form-type map**. If you need it, pass the flag explicitly to
`setConfig()`:

```diff
  setConfig({
+   b2bEnabled: true,
    ...
  });
```

This is independent of the toolchain changes above and applies whether or not
you migrate to pnpm.

---

## 11. Other fixes in this release (no action required)

The 3.0.0 release also bundles a number of accessibility and bug fixes that need
no migration steps — upgrading picks them up automatically: color contrast fixes
(`ProgressSpinner`, disabled `Button` states), a new optional `label` prop on
`Incrementer`, `InputPassword`/`Field` `aria-label`/ `aria-describedby` fixes, a
new `LiveRegion` component plus `Button` `loading`/`loadingLabel` props, `Modal`
hiding background siblings from assistive tech while open, `MultiSelect`
announcement/render-loop fixes, `Pagination` `aria-current`/contrast fixes,
`PasswordStatusIndicator` live-region announcements, `RadioButton` focus-scroll
anchoring, and an `Incrementer` input-flicker/double-`onValue` fix. A new
`sanitizeHtml`/ `createSanitizedHtml` helper (backed by DOMPurify) is also
available for safely rendering untrusted HTML — opt in where useful, not
required.

---

## 12. Verification checklist

After all changes:

```bash
# whichever package manager you're on
pnpm install   # or: yarn install / npm install

pnpm lint              # 0 errors
pnpm format:check      # formatting passes (or: yarn format:check / npm run format:check)
pnpm test               # all tests pass
pnpm type-check          # tsc --noEmit, if you added the script per section 3
pnpm storybook            # dev server starts, stories load
pnpm build:storybook       # static build exits 0
pnpm build                 # .d.ts generation succeeds against your own typescript
```

Also confirm:

- [ ] No remaining reference to a v1-era `.elsie.js`/`.elsie.cjs` config file
      (not part of elsie's config search, see section 1), `elsie types`, or
      `@adobe-commerce/elsie/config/…` (singular) anywhere in scripts, CI, or
      docs.
- [ ] `eslint.config.js` uses `defineConfig(...)` layers, not `createConfig`.
- [ ] `jest.config.js` uses `defineConfig({ preset })`, not `environment`.
- [ ] `.prettierignore` includes `package.json`; `format:check` passes.
- [ ] Tests import from `@adobe-commerce/elsie/tests`(`/dom`|`/preact`) instead
      of relying on ambient jest globals; `@types/jest` removed.
- [ ] Named runtime `jest` imports come directly from a public test tier, not a
      local barrel or `/lib/tests`; shared Jest transform and dependency
      mappings remain intact, and scripts run tests through `elsie test`.
- [ ] Component tests use shared `render` with `src/i18n/en_US.json` at the
      package root, or explicit `langDefinitions`; raw-render tests use
      `renderPreact`. Duplicated local provider wrappers have been removed.
- [ ] Async mocks use function-based Jest 30 types or Elsie's async mock
      helpers; legacy `jest.SpyInstance` and return-type/argument-tuple mock
      types migrated.
- [ ] `typescript` (and `preact`/`@preact/signals`, if used) are your own
      devDependencies at the versions elsie v3 expects.
- [ ] Storybook packages using the shared config export
      `createConfig({ stories, staticDirs, ... })` from `.storybook/main.js` or
      `.mjs`; scripts invoke `elsie storybook [mode]`; shared framework/addon
      devDependencies are removed only where no own files import them directly.
      Story types, play helpers, actions, and `withMinWidth` import from
      `/storybook/types`, `/storybook/tests`, `/storybook/actions`, and
      `/storybook/decorators`; Docs blocks import from `/storybook/blocks`. The
      a11y test-runner imports `a11yTestRunnerConfig` from
      `/storybook/test-runner` and exports it as the default if it used Elsie's
      common hooks.
- [ ] Storybook CI installs browsers with
      `pnpm exec elsie storybook --install-playwright --with-deps`, not a bare
      `pnpm exec playwright` from the consumer.
- [ ] If you migrated to pnpm: `pnpm install --frozen-lockfile` is clean on a
      fully clean `node_modules`; `git status` shows the expected additions
      (`pnpm-lock.yaml`, `pnpm-workspace.yaml`) and deletions (old lockfile, old
      rc files).
