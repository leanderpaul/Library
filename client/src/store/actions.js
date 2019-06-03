import Axios from 'axios';
import jwtDecode from 'jwt-decode';

import { SET_FEEDBACK, SET_CURRENT_USER } from './types';
import setAuthToken from '../utils/setAuthToken';

export const registerUser = userData => dispatch => {
    Axios.post('/auth/register', userData)
        .then(res => {
            dispatch({
                type: SET_FEEDBACK,
                payload: res.data
            });
        })
        .catch(err => {
            dispatch({
                type: SET_FEEDBACK,
                payload: err.response.data
            });
        });
};

export const loginUser = userData => dispatch => {
    Axios.post('/auth/login', userData)
        .then(res => {
            const { token } = res.data;
            localStorage.setItem('jwtToken', token);
            setAuthToken(token);
            dispatch({
                type: SET_CURRENT_USER,
                payload: jwtDecode(token)
            });
        })
        .catch(err => {
            console.log(err.response);
            dispatch({
                type: SET_FEEDBACK,
                payload: err.response.data
            });
        });
};

export const logOutUser = () => dispatch => {
    localStorage.removeItem('jwtToken');
    setAuthToken(false);
    dispatch({
        type: SET_CURRENT_USER,
        payload: {}
    });
};

