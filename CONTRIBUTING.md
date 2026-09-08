# Contributing

Expected runtime: Bun. This repository never uses npm and never commits a `package-lock.json`.

Install:

```sh
bun i
```

Checks maintainers run before publishing:

```sh
bunx code-discipline check
bun run typecheck
bun run build
bun run verify:seo
bun run verify:pack
```

`bun run prepublishOnly` chains the typecheck, `verify:seo`, and `verify:pack` gate.

Generated output stays out of Git: `dist/`, `*.tgz`, `.tmp/`, and discipline report files.

Code Discipline owns alias consistency, file and function size limits, comment removal, and formatting. Run `bunx code-discipline fix <rule>` for a single rule and re-run `bun run typecheck` afterwards. Never run a bare `code-discipline fix`.

This repository has no test suite. Verification is executable and lives in `scripts/verify/`.
