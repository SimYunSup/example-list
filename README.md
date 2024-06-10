# Example

> [!NOTE]
> This is a repository to demonstrate bug report issues and other simple examples on Github.

The current branch looks like this.


## Description

This branch is an example of the lexical table plugin in `payload` v2.

This code was heavily inspired by [Lexical Playground](https://playground.lexical.dev/). The current major package versions for this example are below.

- `payload`: 2.19.3
  - `@payloadcms/bundler-webpack`: 1.0.7
  - `@payloadcms/db-mongodb`: 1.5.1
  - `@payloadcms/richtext-lexical`: 0.11.1
- `@adobe/react-spectrum`: 3.35.1
  - `@react-spectrum/color`: 3.0.0-beta.34
- `@lexical/table`: 0.13.1
- `typescript`: 5.4.5

Here's a link to the code in [Lexical](https://github.com/facebook/lexical/) that we referenced.

- [TableActionMenuPlugin](https://github.com/facebook/lexical/blob/v0.13.1/packages/lexical-playground/src/plugins/TableActionMenuPlugin/index.tsx)
- [TableCellResizer](https://github.com/facebook/lexical/blob/v0.13.1/packages/lexical-playground/src/plugins/TableCellResizer/index.tsx)

I've marked the changes with `ADD` and `END` comments to indicate where they are (I may have missed some).

> [!WARNING]
> For now, due to rapid development, I'm not using the `floatingAnchor` feature in `@payloadcms/lexical` and have applied the dropdown, which is the logic I used in [Playground](https://playground.lexical.dev/). I'll change it to use the feature later if possible or develop a custom plugin.

## ChangeLog

- 2024-05-31
  - Update package
  - Delete unused plugin(`TableEditPlugin`)
  - Add comment
    - Disable because window.pageXOffset is added twice
- 2024-06-10
  - Update package
  - Temporary fix for [facebook/lexical#5199](https://github.com/facebook/lexical/issues/5199)
