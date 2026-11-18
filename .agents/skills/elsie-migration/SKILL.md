---
name: elsie-migration
description:
  Guides migration of consumer packages between major versions of
  @adobe-commerce/elsie. Use when upgrading elsie across a breaking version
  boundary, when asked to migrate a package to elsie v2 or v3, or when
  build-tooling changes (ESLint flat config, Vite, Storybook 10, TypeScript 6,
  the elsie test-kit) are needed. The v2→v3 playbook also covers migrating a
  repo from Yarn or npm to pnpm (including hardening installs with pnpm's
  minimumReleaseAge gate, the nodeLinker hoisted/isolated decision, and
  allowBuilds) — use it too when a user wants to switch a repo's package manager
  to pnpm, mentions converting or deleting a yarn.lock/ package-lock.json, asks
  about minimumReleaseAge/allowBuilds/nodeLinker, or hits errors like "command
  not found" (exit 127), ERR_PNPM_IGNORED_BUILDS, or "Cannot use import
  statement outside a module" after adopting pnpm.
---

# elsie-migration

This skill performs step-by-step migrations of consumer packages to a target
major version of `@adobe-commerce/elsie`.

## How to activate

Invoke this skill when a user says any of:

- "migrate to elsie v2" / "migrate to elsie v3" / "upgrade elsie"
- "apply the elsie migration"
- "update my package to use elsie 2" / "... elsie 3"
- "switch this repo to pnpm" / "migrate off yarn" / "convert to pnpm" — even
  with no elsie version change in play, since the v2→v3 playbook's pnpm section
  is a self-contained migration guide
- or when you detect that a package's installed elsie version is behind a major
  boundary

## Step 1 — Detect versions

Run the detection script to learn what is installed and what is available:

```
scripts/detect-versions.sh [latest|beta|alpha]
```

With no argument it prints the installed version alongside all three channels.
Pass a channel name to show only that channel.

**If the user did not specify a target version**, show them the output and ask
which channel or exact version they want to migrate to (`latest`, `beta`,
`alpha`, or a pinned version like `2.0.0`).

## Step 2 — Choose the migration playbook

| From → To   | Playbook                                         |
| ----------- | ------------------------------------------------ |
| v1.x → v2.x | [references/v1-to-v2.md](references/v1-to-v2.md) |
| v2.x → v3.x | [references/v2-to-v3.md](references/v2-to-v3.md) |

The v2→v3 playbook also covers migrating the consuming repo itself from Yarn or
npm to pnpm (optional, but recommended alongside that upgrade) — invoke this
skill for a standalone pnpm migration too, even without an elsie version bump in
play.

Open the relevant playbook and follow its instructions exactly.

## Step 3 — Apply changes

Work through every section of the playbook in order. After all edits:

1. Run `yarn install` (or the package manager in use).
2. Run the verification checklist at the end of the playbook.

## Step 4 — Report

Summarise what changed (files modified, dependencies added/removed, scripts
updated) and flag any sections that were skipped because they did not apply to
this package.
