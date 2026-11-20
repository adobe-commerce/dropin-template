# dropin-template

## 2.0.0

### Major Changes

- 322ae06: Upgrade to stable Elsie 3.0.0 and migrate development and CI to pnpm.
  Require Node.js 22 or 24, use TypeScript 6 and ESM configuration, and migrate
  Storybook and tests to Elsie's shared configuration and public entry points.

  Update `@adobe-commerce/event-bus` and `@adobe-commerce/storefront-design` to
  1.1.2, `@adobe-commerce/fetch-graphql` to 1.3.2, and `@dropins/build-tools` to
  1.2.2.

  Add Node ambient types and a standalone source type-check command. Use Elsie's
  shared declaration-emission preset and keep source checking separate from
  production, bundle-analysis, and Storybook builds.

## 1.0.1

### Patch Changes

- 5a636b1: Fixes the Provider to merge user-provided langDefinitions with the
  drop-in's default definitions, enabling label/placeholder overrides via the
  initializer API.

## 1.0.0

### Major Changes

- 26a336c: ## Initial stable release (1.0.0)

  This release marks the first stable version of the dropin template,
  incorporating all foundational work since the initial scaffold.

  ### Features
  - **Environment variable support**: `elsie.js` and Storybook's `preview.js`
    now dynamically pick up environment variables at runtime
  - **Codebase cleanup**: Removed unnecessary sandbox code to keep the template
    lean and focused
  - **GraphQL schema validation**: Added a CI workflow that validates GraphQL
    operations on every pull request, including improved parsing of HTML
    fragments in PR descriptions and more specific PR description endpoint link
    format detection

  ### Improvements
  - Updated Node.js engine requirement to `^20.0.0 || ^22.0.0`
  - Fixed and cleaned up `tsconfig.json` (removed `sourceMap` option)
  - Upgraded all core SDK dependencies (`@adobe-commerce/elsie`,
    `@adobe-commerce/event-bus`, `@adobe-commerce/fetch-graphql`,
    `@adobe-commerce/storefront-design`, `@dropins/build-tools`) to their latest
    stable releases
  - Updated README with comprehensive dropin documentation and prerequisites

  ### CI/CD
  - Added PR build workflows on Ubuntu and Windows (`pr-build.yaml`,
    `pr-build-windows.yaml`)
  - Integrated Changesets for automated changelog generation and version
    management
