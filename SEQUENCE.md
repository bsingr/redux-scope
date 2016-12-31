# Sequence diagram

Render with [https://bramp.github.io/js-sequence-diagrams/](https://bramp.github.io/js-sequence-diagrams/)

```
App->Component: run(scope(store))
Component->scope(store): dispatch(action)
scope(store)->store: dispatch(scope(action))
store->scope(reducer): reduce(prevState, scope(action))

scope(reducer)->reducer: reduce(prevState, action)
reducer-->scope(reducer): state
scope(reducer)-->store: state
store-->scope(store):
scope(store)-->Component:
Component->scope(store): getState()
scope(store)->store: getState()
store-->scope(store): state
scope(store)-->Component: state[scope]
Component-->App:
```
