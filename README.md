# Allure timeline is empty — `@wdio/allure-reporter` v10 never sets the `host` label

This project reproduces a regression in `@wdio/allure-reporter` v10:

The Allure [timeline view](https://allurereport.org/docs/timeline/) groups test results by **host** and **thread** to visualise parallel execution. The reporter always sets `LabelName.THREAD` (from `cid`) but **never sets `LabelName.HOST`**. Because the host label is absent from every result file, the timeline view is completely empty.

## Prerequisites

- Node.js 22.19 or newer
- Google Chrome

## Reproduce

```sh
npm ci
npm run reproduce
```

The WebdriverIO spec reporter shows that both tests pass:

```text
[chrome #0-0]    ✓ first test
[chrome #0-0]    ✓ second test
[chrome #0-0] 2 passing (72ms)
```

The `check` script then inspects the generated `allure-results/*.json` files:

```text
Results:  2
  with "host" label:   0
  with "thread" label: 2

BUG REPRODUCED: "host" label is absent from all result files.
The Allure timeline view will be empty.
```

To see the empty timeline visually, generate and open the report:

```sh
npm run report
npm run report:open
```

Navigate to the **Timeline** tab — it is empty.

## Expected

Every `*-result.json` contains `{ "name": "host", "value": "<hostname>" }`.  
The timeline view shows tests grouped under a host row with individual thread lanes, matching the behaviour of other Allure reporters (e.g. `allure-jest`, `allure-pytest`).

## Actual

No result file contains a `host` label. The timeline view renders empty regardless of test count or worker count.

## Root cause

Three label-building sites in `build/index.js` emit `LabelName.THREAD` but omit `LabelName.HOST`:

| Method | Line | THREAD | HOST |
|---|---|---|---|
| `_startCucumberTest` | 1353 | ✅ | ❌ |
| `_startTest` (Mocha / Jasmine) | 1680 | ✅ | ❌ |
| `_emitBaseLabels` | 1941 | ✅ | ❌ |

## Workaround

Set the `ALLURE_LABEL_host` environment variable before the reporter starts. The reporter calls `getEnvironmentLabels()` (from `allure-js-commons`), which reads all `ALLURE_LABEL_*` env vars and spreads them into every label array:

```js
// wdio.conf.js
import { hostname } from 'node:os'
process.env['ALLURE_LABEL_host'] = hostname()
```

## Proposed fix

Add `{ name: LabelName.HOST, value: hostname() }` wherever `LabelName.THREAD` is set:

```diff
+import { hostname } from 'node:os'

 const labels = [
   { name: LabelName.LANGUAGE, value: 'javascript' },
   { name: LabelName.FRAMEWORK, value: 'wdio' },
+  { name: LabelName.HOST,   value: hostname() },
   { name: LabelName.THREAD, value: cid },
   ...getEnvironmentLabels()
 ]
```

## Versions

- `@wdio/cli` and `@wdio/local-runner`: 10.0.2
- `@wdio/allure-reporter`, `@wdio/mocha-framework`, and `@wdio/spec-reporter`: 10.0.1
- Allure CLI: 3.20.1
