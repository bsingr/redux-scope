const { scopeReducer, scopeDispatch, scopeGetState, scopeStore } = require('.');
const chai = require('chai');
const {expect} = chai;
const sinonChai = require('sinon-chai');
const {spy} = require('sinon');

chai.use(sinonChai);

describe('redux-scope', () => {
  describe('scopeStore()', () => {
    it('scopes dispatch()', () => {
      const store = {
        dispatch: spy(),
        getState: () => ({})
      };
      const scopedStore = scopeStore(store)('own-scope/own-child-scope');

      // plain
      store.dispatch({type: 'own-action'});
      expect(store.dispatch).to.be.calledWith({type: 'own-action'});

      // scoped
      scopedStore.dispatch({type: 'own-action'});
      expect(store.dispatch).to.be.calledWith({type: 'own-scope/own-child-scope/own-action'});
    });

    it('scopes getState()', () => {
      const store = {
        dispatch: () => {},
        getState: () => ({
          'own-scope': {
            'own-child-scope': 'own-value'
          }
        })
      };
      const scopedStore = scopeStore(store)('own-scope');
      const childScopedStore = scopeStore(store)('own-scope/own-child-scope');

      // plain
      expect(store.getState()).to.eql({
        'own-scope': {
          'own-child-scope': 'own-value'
        }
      });

      // scoped
      expect(scopedStore.getState()).to.eql({'own-child-scope': 'own-value'});
      expect(childScopedStore.getState()).to.eql('own-value');
    });
  });

  describe('scopeDispatch()', () => {
    it('appends scope to actions, calls dispatch and returns result', () => {
      const action = {type: 'own-action'};
      const dispatch = spy(a => a);
      const scopedDispatch = scopeDispatch(dispatch)('own-scope/own-child-scope');
      const result = scopedDispatch(action);
      expect(dispatch).to.be.calledWith({type: 'own-scope/own-child-scope/own-action'});
      expect(result).to.eql({type: 'own-scope/own-child-scope/own-action'});
    });

    it('appends scope to functional actions, calls dispatch and returns result', () => {
      const action = () => 'own-action-result';
      action.type = 'own-action';
      const dispatch = spy(a => a);
      const scopedDispatch = scopeDispatch(dispatch)('own-scope/own-child-scope');
      const result = scopedDispatch(action);
      expect(dispatch).to.be.calledWithMatch(action);
      expect(result.type).to.eql('own-scope/own-child-scope/own-action');
      expect(result()).to.eql('own-action-result');
    });

    it('appends scope to functional actions w/out type, calls dispatch and returns result', () => {
      const action = () => 'own-action-result';
      const dispatch = spy(a => a);
      const scopedDispatch = scopeDispatch(dispatch)('own-scope/own-child-scope');
      const result = scopedDispatch(action);
      expect(dispatch).to.be.calledWithMatch(action);
      expect(result.type).to.eql('own-scope/own-child-scope/');
      expect(result()).to.eql('own-action-result');
    });

    describe('nested scopeDispatch()', () => {
      it('appends scope to actions with scope, calls dispatch and returns result', () => {
        const action = {type: 'an-action'};
        const dispatch = spy(a => a);
        const rootScopedDispatch = scopeDispatch(dispatch)('shared-scope/shared-child-scope');
        const scopedDispatch = scopeDispatch(rootScopedDispatch)('own-scope/own-child-scope');
        const result = scopedDispatch(action);
        expect(dispatch).to.be.calledWith({type: 'shared-scope/shared-child-scope/own-scope/own-child-scope/an-action'});
        expect(result).to.eql({type: 'shared-scope/shared-child-scope/own-scope/own-child-scope/an-action'});
      });
    });
  });

  describe('scopeGetState()', () => {
    it('returns subset of state', () => {
      const getState = () => ({
        'own-scope': {
          'own-child-scope': 'own-value'
        }
      });
      const scopedGetState = scopeGetState(getState)('own-scope');
      const childScopedGetState = scopeGetState(getState)('own-scope/own-child-scope');

      // plain
      expect(getState()).to.eql({
        'own-scope': {
          'own-child-scope': 'own-value'
        }
      });

      // scoped
      expect(scopedGetState()).to.eql({'own-child-scope': 'own-value'});
      expect(childScopedGetState()).to.eql('own-value');
    });

    it('returns subset of state by array index', () => {
      const getState = () => ({
        'own-scope': {
          'list': [
            {
              'item-one': 1
            },
            {
              'item-two': 2
            }
          ]
        }
      });
      expect(scopeGetState(getState)('own-scope/list/0/item-one')()).to.equal(1);
      expect(scopeGetState(getState)('own-scope/list/1/item-two')()).to.equal(2);
      expect(scopeGetState(getState)('own-scope/list/2/item-three')()).to.equal(undefined);
    });
  });

  describe('scopeReducer()', () => {
    describe('concrete scope', () => {
      it('still receives global (== unscoped) actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('own-scope/own-child-scope');
        scopedReducer(undefined, {type: 'an-action'});
        expect(reducer).to.be.calledWith(undefined, {type: 'an-action'});
      });

      it('receives own scoped actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('own-scope/own-child-scope');
        scopedReducer(undefined, {type: 'own-scope/own-child-scope/an-action'});
        expect(reducer).to.be.calledWith(undefined, {type: 'an-action'});
      });

      it('doesnt receive foreign scoped actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('own-scope/own-child-scope');
        scopedReducer(undefined, {type: 'foreign-scope/foreign-child-scope/an-action'});
        expect(reducer).to.be.not.calledWith(undefined, {type: 'an-action'});
      });
    });

    describe('wildcard scope', () => {
      it('still receives global (== unscoped) actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('*');
        scopedReducer(undefined, {type: 'an-action'});
        expect(reducer).to.be.calledWith(undefined, {type: 'an-action'});
      });

      it('receives own scoped actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('*');
        scopedReducer(undefined, {type: 'own-scope/own-child-scope/an-action'});
        expect(reducer).to.be.calledWith(undefined, {type: 'an-action'});
      });

      it('receives foreign scoped actions', () => {
        const reducer = spy();
        const scopedReducer = scopeReducer(reducer)('*');
        scopedReducer(undefined, {type: 'foreign-scope/foreign-child-scope/an-action'});
        expect(reducer).to.be.calledWith(undefined, {type: 'an-action'});
      });
    });
  });
});
