import { combineReducers } from 'redux'

import { SET_CURRENT_USER, SET_FEEDBACK } from './types';

const authInitialState = {
    isAuthenticated: false,
    user: {}
};

export function authReducer(state = authInitialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            return {
                ...state,
                isAuthenticated: Object.keys(action.payload).length > 0,
                user: action.payload
            };

        default:
            return state;
    }
}

const feedbackInitialState = {};

export function feedbackReducer(state = feedbackInitialState, action) {
    switch (action.type) {
        case SET_FEEDBACK:
            if (action.payload === 'Unauthorized') return { msg: 'You must be Logged in to access this feature !' };
            return action.payload;

        default:
            return state;
    }
}

// export default combineReducers({
//     authReducer,
//     feedbackReducer
// });
