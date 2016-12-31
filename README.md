# redux-scope

## Basic idea

1. redux action types are prefixed with a scope (`your-action` becomes `path/to/scope/your-action`)
2. components must NOT know about this; instead they use scoped versions of `getState()` and `dispatch()`
3. reducers must NOT know about this; instead they scope is removed before they receive their actions

## Features

- provides scoped versions of `getState()` and `dispatch()` of `redux`
- provides scoped version of redux store that can be passed to `connect()` of `react-redux`
- provides scoped versions of your reducer functions

## Usage

`import {scopeGetState, scopeDispatch, scopeReducer, scopeStore} from 'redux-react'`

...

## Try out

See [examples/accounts.js](./examples/accounts.js).

- Install `npm install`
- Tests `npm test`
- Examples `node examples/accounts.js`
