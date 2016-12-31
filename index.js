const SCOPE_DELIMITER = '/';
const SCOPE_WILDCARD = '*';

// prefix action type with given scope
const scopeType = (type, scope) => typeof type === 'string' ? scope + SCOPE_DELIMITER + type : scope;

// remove given scope from action type
const descopeType = (type, scope) => typeof type === 'string' && type.startsWith(scope) ? type.substring(scope.length + SCOPE_DELIMITER.length) : type;

// remove any given scope from action type
const descopeAnyType = type => typeof type === 'string' ? type.substring(type.lastIndexOf(SCOPE_DELIMITER) + 1) : type;

// change the type of the action with given scope
const scopeAction = (action, scope) => {
  action.type = scopeType(action.type, scope);
  return action;
};

// change the type of the action with given scope
const descopeAction = (action, scope) => {
  const type = (scope === SCOPE_WILDCARD) ? descopeAnyType(action.type) : descopeType(action.type, scope);
  return Object.assign({}, action, {type});
};

// returns a new dispatch() function
// that prefixes all action types using given scope
const scopeDispatch = dispatch => scope => action => dispatch(scopeAction(action, scope));

// returns a new getState() function
// that extracts the a subset of the root state using given scope
const scopeGetState = getState => scope => () => scope.split(SCOPE_DELIMITER).reduce(
  (state, scope) => state ? state[scope] : undefined,
  getState()
);

// scopes the dispatch and getState functions of the store
const scopeStore = store => {
  const createScopedDispatch = scopeDispatch(store.dispatch);
  const createScopedGetState = scopeGetState(store.getState);
  return scope => Object.assign({}, store, {
    dispatch: createScopedDispatch(scope),
    getState: createScopedGetState(scope)
  });
};

// descopes all actions before passed to the reducer
const scopeReducer = reducer => scope => (previousState, action) => reducer(previousState, descopeAction(action, scope));

module.exports = {
  scopeReducer,
  scopeDispatch,
  scopeStore,
  scopeGetState
};
