# Example

> [!NOTE]
> This is a repository to demonstrate bug report issues and other simple examples on Github.

The current branch looks like this.

- Payload V2 with Lexical Table: [Link](https://github.com/SimYunSup/example-list/tree/payload/v2-lexical-table)
- Payload Bug report [#6583](https://github.com/payloadcms/payload/issues/6583): [Link](https://github.com/SimYunSup/example-list/tree/payload/bug-postgres-nested-id)
- drizzle-kit Bug report: [Link](https://github.com/SimYunSup/example-list/tree/drizzle-kit/jsonb-error) (Deleted because drizzle-kit-mirror repo is deleted)
- Blazor WASM example with IIFE example: [Link](https://github.com/SimYunSup/example-list/tree/blazorwasm/use-with-iife)

ParamQuery Grid가 IIFE 방식으로 컴파일되어있어 ESM만 취급하는 Blazor에서 사용하기 힘듧니다. 그래서 여러 형식을 ESM으로 바꿀 수 있는 ESbuild를 사용하여 사용하는 법을 소개합니다.

## ESBuild 구성

MSBuild에서 빌드할 수 있도록 csproj에 nodejs 빌드 과정을 추가합니다.

```xml
<Project>
  <Target Name="NpmInstall" Inputs="package.json" Outputs="node_modules/.install-stamp">
    <!-- 만약 package.json이 바뀌었을 경우 새로 설치 -->
    <Exec Command="pnpm i" Condition="$(RestorePackagesWithLockFile) != 'true'" ConsoleToMsBuild="true" />

    <!-- 새로 설치했을 경우 다시 설치하지 않기 위해 파일 생성 -->
    <Touch Files="node_modules/.install-stamp" AlwaysCreate="true" />
    <PropertyGroup>
      <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
    </PropertyGroup>
  </Target>
  <Target Name="PreBuild" DependsOnTargets="NpmInstall" BeforeTargets="BeforeBuild">
    <Message Text="TypeScript 컴파일 중" Importance="high" />
    <PropertyGroup>
      <!-- watch는 MSBuild에서 명령어 detach형태를 제공하지 않기 때문에 그냥 build만. -->
      <NodeCommand Condition="$(Configuration) == 'Release'">pnpm build</NodeCommand>
      <!-- dev에서만 실행하는 코드를 위해 따로 구성. -->
      <NodeCommand Condition="$(Configuration) != 'Release'">pnpm build:dev</NodeCommand>
    </PropertyGroup>
    <Exec Command="$(NodeCommand)" />
  </Target>
</Project>
```

### .gitignore 구성

```text

build/
node_modules/
.DS_Store
.env
# 빌드 결과물 포함 안되게 하기 위해 제외.
**/*.razor.js
```

## ESBuild 구성

ESBuild는 config파일을 통해 바로 컴파일이 불가하기 때문에 스크립트를 구성합니다.

```mjs
/**@type {import("esbuild").BuildOptions} */
export default {
  // 다시 빌드할 때 overwrite 
  allowOverwrite: true,
  // 빌드 결과물 어디에 둘 것인지
  outdir: ".",
  // 빌드 결과물 directory 구성 기반 설정
  outbase: ".",
  entryPoints: [
    "**/*.razor.ts",
  ],
  // 이미지/폰트를 어떻게 로드할 것인지
  loader: {
    ".png": "file",
    ".woff2": "file",
    ".woff": "file",
    ".gif": "file",
  },
  bundle: true,
  splitting: true,
  // Blazor에서 쓸 수 있게 ESM 방식으로 로드.
  format: "esm",
  platform: "browser",
  entryNames: "[dir]/[name]",
  // 기타 파일들 위치 방식 설정
  assetNames: "build/[dir]/[name]",
  define: {
    "import.meta.env.MODE": "\"production\"",
  }
}
```

> [!NOTE]
> 파일 확장자가 mjs인 이유는 Node.js에게 이 파일 형식이 ESM임을 알려주기 위해서입니다.

이 config파일을 import해서 실행합니다.

```mjs
import { build } from "esbuild";
import options from "./esbuild.config.mjs";
import cssOptions from "./esbuild.css.config.mjs";

await Promise.allSettled([
  build(options).catch(() => process.exit(1)),
  // pqgrid가 CSS파일도 import해야 하길래 추가한 설정. 무시해도 됩니다.
  build(cssOptions).catch(() => process.exit(1)),
])
```

이 스크립트를 실행하는 명령어를 `package.json`에서 선언합니다.

```json
{
  "scripts": {
    "build:dev": "node ./Config/build.mjs --mode='develop'",
    "build": "node ./Config/build.mjs --mode='production'"
  }
}
```

이러면 빌드/watch를 실행할 때 ESbuild를 실행하여 JS파일을 생성합니다. 그러면 생성된 파일을 바로 JSInterop을 통해 import해서 사용하면 됩니다.

