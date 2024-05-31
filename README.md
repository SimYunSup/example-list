# Example

> [!NOTE]
> This is a repository to demonstrate bug report issues and other simple examples on Github.

## Description

This branch is an reproduction of the `@payload/db-postgres` in `payload` v2.

This bug is reported in [payloadcms/payload#6583](https://github.com/payloadcms/payload/issues/6583)

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

<details>
<summary>
Reported Bug
</summary>

```text
[16:56:40] ERROR (payload): TypeError: Cannot read properties of undefined (reading 'nested_blocks_just_text_pkey')
    at upsertRow (D:\GithubProject\example-list\node_modules\.pnpm\@payloadcms+db-postgres@0.8.4_@types+react@18.3.3_payload@2.18.3_@swc+helpers@0.5.11_@types+r_utjmzo3j7ceboprn5scvypgwvm\node_modules\@payloadcms\db-postgres\src\upsertRow\index.ts:318:57)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.updateOne (D:\GithubProject\example-list\node_modules\.pnpm\@payloadcms+db-postgres@0.8.4_@types+react@18.3.3_payload@2.18.3_@swc+helpers@0.5.11_@types+r_utjmzo3j7ceboprn5scvypgwvm\node_modules\@payloadcms\db-postgres\src\update.ts:44:18)
    at async updateByID (D:\GithubProject\example-list\node_modules\.pnpm\payload@2.18.3_@swc+helpers@0.5.11_@types+react@18.3.3_esbuild@0.19.12_typescript@5.4.5_webpa_w2wwwoljy4lt2mm3kbswof65oi\node_modules\payload\src\collections\operations\updateByID.ts:269:16)
    at async updateByIDHandler (D:\GithubProject\example-list\node_modules\.pnpm\payload@2.18.3_@swc+helpers@0.5.11_@types+react@18.3.3_esbuild@0.19.12_typescript@5.4.5_webpa_w2wwwoljy4lt2mm3kbswof65oi\node_modules\payload\src\collections\requestHandlers\updateByID.ts:43:17)
```

</details>

I think It must replace nested ID.

Same in `3.0.0-beta.39`, because `DUPLICATE_ROW` has same logic.

https://github.com/payloadcms/payload/blob/c7fbd76dae35b61bc82a186b889ad136ce98d264/packages/ui/src/forms/Form/fieldReducer.ts#L247-L274


<details>
<summary>
Reported Bug in `3.0.0-beta.39`
</summary>

```text
 POST /api/form-state 200 in 29ms
 POST /api/form-state 200 in 31ms
[17:45:40] ERROR: TypeError: Cannot read properties of undefined (reading 'nested_blocks_just_text_pkey')
    at upsertRow (webpack-internal:///(rsc)/./node_modules/.pnpm/@payloadcms+db-postgres@3.0.0-beta.39_payload@3.0.0-beta.39_react@19.0.0-rc-f994737d14-202405_2nspayvwlqhwq63fyyc272u4ay/node_modules/@payloadcms/db-postgres/dist/upsertRow/index.js:262:59)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Object.updateOne (webpack-internal:///(rsc)/./node_modules/.pnpm/@payloadcms+db-postgres@3.0.0-beta.39_payload@3.0.0-beta.39_react@19.0.0-rc-f994737d14-202405_2nspayvwlqhwq63fyyc272u4ay/node_modules/@payloadcms/db-postgres/dist/update.js:49:20)
    at async updateByIDOperation (webpack-internal:///(rsc)/./node_modules/.pnpm/payload@3.0.0-beta.39_@swc+core@1.5.24_@swc+types@0.1.7_graphql@16.8.1_typescript@5.4.5/node_modules/payload/dist/collections/operations/updateByID.js:222:22)
    at async Object.updateByID (webpack-internal:///(rsc)/./node_modules/.pnpm/@payloadcms+next@3.0.0-beta.39_graphql@16.8.1_monaco-editor@0.49.0_next@15.0.0-rc.0_payload@3_bycrjqlo3lguyhsywwxtlataiy/node_modules/@payloadcms/next/dist/routes/rest/collections/updateByID.js:25:17)
    at async eval (webpack-internal:///(rsc)/./node_modules/.pnpm/@payloadcms+next@3.0.0-beta.39_graphql@16.8.1_monaco-editor@0.49.0_next@15.0.0-rc.0_payload@3_bycrjqlo3lguyhsywwxtlataiy/node_modules/@payloadcms/next/dist/routes/rest/index.js:687:35)
    at async D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:63352
    at async eP.execute (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:54549)
    at async eP.handle (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\compiled\next-server\app-route.runtime.dev.js:6:64693)
    at async doRender (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:1419:42)
    at async responseGenerator (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:1640:40)
    at async DevServer.renderToResponseWithComponentsImpl (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:1665:28)
    at async DevServer.renderPageComponent (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:1978:24)
    at async DevServer.renderToResponseImpl (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:2016:32)
    at async DevServer.pipeImpl (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:908:25)
    at async NextNodeServer.handleCatchallRenderRequest (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\next-server.js:273:17)
    at async DevServer.handleRequestImpl (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\base-server.js:804:17)
    at async D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\dev\next-dev-server.js:339:20
    at async Span.traceAsyncFn (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\trace\trace.js:157:20)
    at async DevServer.handleRequest (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\dev\next-dev-server.js:336:24)
    at async invokeRender (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\lib\router-server.js:175:21)
    at async handleRequest (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\lib\router-server.js:354:24)
    at async requestHandlerImpl (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\lib\router-server.js:378:13)
    at async Server.requestListener (D:\GithubProject\test-p-beta\node_modules\.pnpm\next@15.0.0-rc.0_react-dom@19.0.0-rc-f994737d14-20240522_react@19.0.0-rc-f994737d14-20240522\node_modules\next\dist\server\lib\start-server.js:142:13)
```

</detail>

## ChangeLog

- Add README and Issue number
