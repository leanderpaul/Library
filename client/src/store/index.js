import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunk from 'redux-thunk';

import { authReducer, feedbackReducer } from './reducers';

const middlewares = [thunk];
const devToolsMiddleware = compose(
    applyMiddleware(...middlewares),
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

const reducers = combineReducers({ auth: authReducer, feedback: feedbackReducer });

const store = createStore(reducers, {}, devToolsMiddleware);

export default store;
