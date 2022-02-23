import fs from 'fs';
import path from 'path';

const gitignore = `
*.log
.DS_Store
node_modules
dist
`;

const tsconfig = `
{
    // see https://www.typescriptlang.org/tsconfig to better understand tsconfigs
    "include": ["src", "types"],
    "compilerOptions": {
      "module": "esnext",
      "lib": ["dom", "esnext"],
      "importHelpers": true,
      // output .d.ts declaration files for consumers
      "declaration": true,
      // output .js.map sourcemap files for consumers
      "sourceMap": true,
      // match output dir to input dir. e.g. dist/index instead of dist/src/index
      "rootDir": "./src",
      // stricter type-checking for stronger correctness. Recommended by TS
      "strict": true,
      // linter checks for common issues
      "noImplicitReturns": true,
      "noFallthroughCasesInSwitch": true,
      // noUnused* overlap with @typescript-eslint/no-unused-vars, can disable if duplicative
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      // use Node's module resolution algorithm, instead of the legacy TS one
      "moduleResolution": "node",
      // transpile JSX to React.createElement
      "jsx": "react",
      // interop between ESM and CJS modules. Recommended by TS
      "esModuleInterop": true,
      // significant perf increase by skipping checking .d.ts files, particularly those in node_modules. Recommended by TS
      "skipLibCheck": true,
      // error out if import and file system have a casing mismatch. Recommended by TS
      "forceConsistentCasingInFileNames": true,
      "noEmit": true,
      // Directory where typescript output declaration files
      "declarationDir": "./dist/types"
    }
  }
`;

const readme = `
# Package documentation
`;

const licence = `
MIT License

Copyright (c) <year> <author>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const jestConfig = `
module.exports = {
  transform: {
    '.(ts|tsx)$': require.resolve('ts-jest/dist'),
    '.(js|jsx)$': require.resolve('babel-jest'), // jest's default
  },
  transformIgnorePatterns: ['[/\\\\\\\\]node_modules[/\\\\\\\\].+\\\\.(js|jsx)$'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.{ts,tsx,js,jsx}'],
  testMatch: ['<rootDir>/tests/**/*.(spec|test).{ts,tsx,js,jsx}'],
  testURL: 'http://localhost',
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
};
`;

const test = `
import { SayHello } from '../src';

describe('SayHello Tests', () => {
  it('Greet the user provided name', () => {
    expect(SayHello('Bertrand')).toEqual('Hello, Bertrand');
  });
});
`;

const defaultScript = `
export const SayHello = (name: string) => \`Hello, \${name}\`;
`;

const gitflowMain = `
# This workflow will run tests using node and then publish a package to GitHub Packages when a release is created
# For more information see: https://help.github.com/actions/language-and-framework-guides/publishing-nodejs-packages

name: Deployment

on:
  push:
    branches:
      - master

jobs:
  build:
    name: Build, lint, and test on Node \${{ matrix.node }} and \${{ matrix.os }}

    runs-on: \${{ matrix.os }}
    strategy:
      matrix:
        node: ['14.x', '16.x']
        os: [ubuntu-latest, windows-latest, macOS-latest]

    steps:
      - name: Checkout repo
        uses: actions/checkout@v2

      - name: Use Node \${{ matrix.node }}
        uses: actions/setup-node@v1
        with:
          node-version: \${{ matrix.node }}

      - name: Check npm version
        run: npm -v

      - name: Removes package-lock.json
        run: rm package-lock.json

      - name: Install deps and build (with cache)
        uses: bahmutov/npm-install@v1
        with:
          useLockFile: false

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
    env:
      NODE_AUTH_TOKEN: \${{secrets.GITHUB_TOKEN}}

  publish-gpr:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 12
          registry-url: https://npm.pkg.github.com/
          scope: '@iazlabs'
      - name: Check npm version
        run: npm -v

      - name: Removes package-lock.json
        run: rm package-lock.json

      - name: Install deps and build (with cache)
        uses: bahmutov/npm-install@v1
        with:
          useLockFile: false

      - run: npm publish
    env:
      NODE_AUTH_TOKEN: \${{secrets.GITHUB_TOKEN}}

`;

const gitflowSize = `
name: size
on: [pull_request]
jobs:
  size:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v2

      - name: Use Node
        uses: actions/setup-node@v1
        with:
          node-version: 16

      - name: Check npm version
        run: npm -v

      - name: Removes package-lock.json
        run: rm package-lock.json

      - name: Install deps and build
        uses: bahmutov/npm-install@v1
        with:
          useLockFile: false

      - run: npm run size
    
    env:
      CI_JOB_NUMBER: 1
      NODE_AUTH_TOKEN: \${{secrets.GITHUB_TOKEN}}

`;

const esLintConfig = `
{
  "root": true,
  "extends": [
      "eslint:recommended",
      "plugin:@typescript-eslint/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
      "project": [
          "./tsconfig.json"
      ]
  },
  "plugins": [
      "@typescript-eslint"
  ],
  "rules": {
      "@typescript-eslint/no-explicit-any": 0
  },
  "ignorePatterns": [
      "src/**/*.test.ts",
      "src/frontend/generated/*"
  ]
}
`;

const babelConfig = `
{
    "presets": [
      "@babel/preset-env",
      "@babel/preset-typescript"
    ],
    "plugins": [
      "@babel/plugin-proposal-class-properties"
    ]
}
`;

const writeContent = (path_: string, content: string) => {
  fs.open(path_, 'w+', (err, fd) => {
    if (err) {
      throw new Error(err.message);
    }
    try {
      fs.writeFileSync(fd, content);
    } finally {
      fs.close(fd);
    }
  });
};

export const createProjectStructure = (path_: string) => {
  if (!fs.existsSync(path_)) {
    fs.mkdirSync(path_, { recursive: true });
  }

  // TODO : CREATE THE .gitignore
  writeContent(path.join(path_, '.gitignore'), gitignore);

  // TODO : CREATE THE tsconfig
  writeContent(path.join(path_, 'tsconfig.json'), tsconfig);

  // TODO : CREATE THE README
  writeContent(path.join(path_, 'README.md'), readme);

  // TODO : CREATE LICENSE
  writeContent(path.join(path_, 'LICENSE'), licence);

  // TODO : ADD eslintrc configurations
  writeContent(path.join(path_, '.eslintrc.json'), esLintConfig);

  // TODO : ADD eslintrc jest.config.js
  writeContent(path.join(path_, 'jest.config.js'), jestConfig);

  // TODO : ADD .babelrc configurations
  writeContent(path.join(path_, '.babelrc'), babelConfig);

  // TODO : CREATE TEST FILES
  if (!fs.existsSync(path.join(path_, 'tests'))) {
    fs.mkdirSync(path.join(path_, 'tests'), { recursive: true });
  }
  writeContent(path.join(path_, 'tests', 'index.spec.ts'), test);

  // TODO : CREATE SCRIPT FILES
  if (!fs.existsSync(path.join(path_, 'src'))) {
    fs.mkdirSync(path.join(path_, 'src'), { recursive: true });
  }
  writeContent(path.join(path_, 'src', 'index.ts'), defaultScript);

  // TODO : CREATE GIT FLOW FILES
  if (!fs.existsSync(path.join(path_, '.github', 'workflows'))) {
    fs.mkdirSync(path.join(path_, '.github', 'workflows'), { recursive: true });
  }
  writeContent(
    path.join(path_, '.github', 'workflows', 'main.yml'),
    gitflowMain
  );
  writeContent(
    path.join(path_, '.github', 'workflows', 'size.yml'),
    gitflowSize
  );
};
