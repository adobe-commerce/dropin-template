---
'dropin-template': major
---

Upgrade to stable Elsie 3.0.0 and migrate development and CI to pnpm. Require
Node.js 22 or 24, use TypeScript 6 and ESM configuration, and migrate Storybook
and tests to Elsie's shared configuration and public entry points.

Update `@adobe-commerce/event-bus` and `@adobe-commerce/storefront-design` to
1.1.2, `@adobe-commerce/fetch-graphql` to 1.3.2, and `@dropins/build-tools` to
1.2.2.

Add Node ambient types and a standalone source type-check command. Use Elsie's
shared declaration-emission preset and keep source checking separate from
production, bundle-analysis, and Storybook builds.
