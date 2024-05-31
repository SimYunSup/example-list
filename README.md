# Example

> [!NOTE]
> This is a repository to demonstrate bug report issues and other simple examples on Github.

## Description

This branch is an reproduction of the `@payload/db-postgres` in `payload` v2.

The current major package versions for this example are below.

- `node`: 20.14
- `payload`: 2.18.3
  - `@payloadcms/bundler-webpack`: 1.0.6
  - `@payloadcms/db-postgres`: 0.8.4
- `typescript`: 5.4.5

### Reproduction Step

1. Create a `Nested` collection item.
2. Fill in the fields in one of the order listed below.
  1. Block in Block
    - Create `nested-block` in `blocks`
    - Create `just-text` in `nested`
    - Fill `title`(optional)
  2. Array in Block
    - Create `nested-array` in `blocks`
    - Create item in `nested`
    - Fill `title`(optional)
  3. Block in Array
    - Create item in `nestedArrayBlocks`
    - Create `just-text` in `nested`
    - Fill `title`(optional)
  4. Block in Block
    - Create item in `nestedArrayArray`
    - Create item in `nested`
    - Fill `title`(optional)
3. Duplicates any top-level Block or Array.
4. When you submit, you should get an error.

### Expected bug Step

Fixed payload content at commit [`4ffddea`](https://github.com/payloadcms/payload/tree/4fddea86ebd5f21705be2310f8b7053d31109189)

1. Call `dispatchFields` by click Duplicate button.
2. Run `DUPLICATE_ROW` in `fieldReducer`.
  - https://github.com/payloadcms/payload/blob/4fddea86ebd5f21705be2310f8b7053d31109189/packages/payload/src/admin/components/forms/Form/fieldReducer.ts#L219-L249
3. Replace block/array ID only top-level
  - https://github.com/payloadcms/payload/blob/4fddea86ebd5f21705be2310f8b7053d31109189/packages/payload/src/admin/components/forms/Form/fieldReducer.ts#L225
  - https://github.com/payloadcms/payload/blob/4fddea86ebd5f21705be2310f8b7053d31109189/packages/payload/src/admin/components/forms/Form/fieldReducer.ts#L228

I think It must replace nested ID.

## ChangeLog
