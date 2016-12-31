const {createStore, combineReducers} = require('redux');
const {scopeStore, scopeReducer} = require('..');

// 1) write plain reducer
const account = (previousState = 0, action) => {
  switch (action.type) {
    case 'update':
      return previousState + action.value;
    default:
      return previousState;
  }
};

// 2) build store with scoped reducers
const scopeAccount = scopeReducer(account);
const store = createStore(combineReducers({
  any: scopeAccount('*'),
  melinda: scopeAccount('melinda'),
  tom: scopeAccount('tom'),
  plain: account
}));

// 3) use dispatch and getState with or without scopes
const scopedStore = scopeStore(store);
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || 0 init`);
scopedStore('melinda').dispatch({type: 'update', value: 7000});
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || +7000 melinda/update`);
scopedStore('tom').dispatch({type: 'update', value: 500});
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || +500 tom/update `);
scopedStore('tom').dispatch({type: 'update', value: 100});
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || +100 tom/update`);
scopedStore('melinda').dispatch({type: 'update', value: 2000});
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || +2000 melinda/update`);
store.dispatch({type: 'update', value: 33});
console.log(`any ${store.getState().any} | melinda ${scopedStore('melinda').getState()} | tom ${scopedStore('tom').getState()} | plain ${store.getState().plain} || +33 update`);

// 4) comprehend the output
// any 0 | melinda 0 | tom 0 | plain 0 || 0 init
// any 7000 | melinda 7000 | tom 0 | plain 0 || +7000 melinda/update
// any 7500 | melinda 7000 | tom 500 | plain 0 || +500 tom/update
// any 7600 | melinda 7000 | tom 600 | plain 0 || +100 tom/update
// any 9600 | melinda 9000 | tom 600 | plain 0 || +2000 melinda/update
// any 9633 | melinda 9033 | tom 633 | plain 33 || +33 update
