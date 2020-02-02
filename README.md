# rusty-ts

[![Build Status](https://travis-ci.com/kylejlin/rusty-ts.svg?branch=master)](https://travis-ci.com/kylejlin/rusty-ts)
[![Coverage Status](https://coveralls.io/repos/github/kylejlin/rusty-ts/badge.svg?branch=master)](https://coveralls.io/github/kylejlin/rusty-ts?branch=master)
[![npm version](https://badge.fury.io/js/rusty-ts.svg)](https://www.npmjs.com/package/rusty-ts)
[![Downloads](https://img.shields.io/npm/dm/rusty-ts.svg)](https://www.npmjs.com/package/rusty-ts)

Rust-inspired `Option` and `Result` types for TypeScript.

## Usage

```bash
npm install --save rusty-ts
```

### Option

```ts
import { Option, option } from "rusty-ts";

const a = option.some("foo");
const b = a.map(x => x.toUpperCase());

const c = option.some(3);
const d = a.andThen(a => c.map(c => a.repeat(c)));

function f(opt: Option<string>) {
  console.log(opt.unwrap());
}

// Logs "FOOFOOFOO"
f(d);
```

### Result

```ts
import { Result, result } from "rusty-ts";

const a = result.ok("foo");
const b = a.map(x => x.toUpperCase());

const c = result.err(3);
const d = c.orElse(cError => b.map(bVal => bVal.repeat(cError)));

function f(opt: Result<string>) {
  console.log(opt.unwrap());
}

// Logs "FOOFOOFOO"
f(d);
```

### Why `Option` _and_ `option` (or `Result` and `result`)?

`Option` is just an interface—any `Option`-compatible code you write will be compatible with any implementation of `Option`.
This gives you the flexibility to implement `Option` however you like.

However, you probably don't want to write your own implementation, so we provide you with one out-of-the-box.
The `option` object provides a namespace that groups the factories
of the default implementation.
To instantiate an Some or None variant, simply call `option.some()` or `option.none()`, respectively.

The same goes for `Result` (the interface), and `result` (the namespace containing the factory functions).

## API Docs

Docs can be found [here](https://kylejlin.github.io/rusty-ts/).
