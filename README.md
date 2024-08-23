# Example

## Description

This branch is an reproduction of the `drizzle-kit`.

`drizzle-kit` version is `0.24.1`.

<del>This bug is reported in [drizzle-team/drizzle-kit-mirror#458](https://github.com/drizzle-team/drizzle-kit-mirror/issues/458)</del>

drizzle-kit-mirror is merged to [drizzle-team/drizzle-kit](https://github.com/drizzle-team/drizzle-orm). So the bug report was cleared. To create an issue, you can use this example.

### Reproduction Step

1. Run `pnpm make:first`
2. Run `pnpm make:second`

### What is bug part?

When Changing `varchar()` to `jsonb()`, `generateMigration` generate like below.

```sql
ALTER TABLE "tests" ALTER COLUMN "json" SET DATA TYPE jsonb;
```

It generate migration error as `Token "json" is invalid.`.

So I think it must be like below.

```sql
ALTER TABLE "tests" ALTER COLUMN "json" SET DATA TYPE jsonb USING to_jsonb("json");
```

## ChangeLog

- 2024-08-23
  - Update `drizzle-kit` version.
  - Update issue link.
