# Example

> [!NOTE]
> This is a repository to demonstrate bug report issues and other simple examples on Github.

## Description

This branch is an reproduction of the `drizzle-kit`.

`drizzle-kit` version is `0.22.6`.

This bug is reported in [drizzle-team/drizzle-kit-mirror#458](https://github.com/drizzle-team/drizzle-kit-mirror/issues/458)


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
