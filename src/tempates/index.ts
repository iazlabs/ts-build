export const template = {
  name: "basic",
  dependencies: [
    "husky",
    "@iazlabs/ts-build",
    "tslib",
    "typescript",
    "size-limit",
    "@size-limit/preset-small-lib",
    "jest",
    "ts-jest",
    "@types/jest",
    "jest-watch-typeahead",
    "@typescript-eslint/parser",
    "@typescript-eslint/eslint-plugin",
    "@betterer/typescript",
    "@betterer/cli",
    "prettier",
  ],
  packageJson: {
    version: "0.1.0",
    license: "MIT",
    main: "dist/index.js",
    typings: `dist/types/index.d.ts`,
    files: ["dist/**/*"],
    engines: {
      node: ">=14",
    },
    scripts: {
      build: "ts-build build",
      lint: "ts-build lint",
      prepare: "git config core.hookspath .githooks && ts-build build",
      size: "size-limit",
      analyze: "size-limit --why",
      test: "jest",
      betterer: "betterer --strict",
      prettier: "prettier --write src/**/*",
    },
    husky: {
      hooks: {
        "pre-commit": "eslint",
      },
    },
    prettier: {
      printWidth: 80,
      semi: true,
      singleQuote: true,
      trailingComma: "es5",
    },
    exports: {
      ".": {
        import: "./dist/esm/index.js",
        require: "./dist/cjs/index.js",
        default: "./dist/cjs/index.js",
      },
    },
  } as { [index: string]: any },
} as { [index: string]: any };

export { composePackageJson } from "./helpers";
export { createProjectStructure } from "./project";
