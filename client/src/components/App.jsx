import React from 'react';
import Axios from 'axios';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import jwtDecode from 'jwt-decode';

import '../resources/App.css';

import Navbar from './Navbar';
import Footer from './Footer';
import Home from './Home';
import Search from './Search';
import Library from './Library';

import store from '../store';
import { SET_CURRENT_USER } from '../store/types';
import setAuthToken from '../utils/setAuthToken';
import Login from './Login';
import Register from './Register';

class App extends React.Component {
    constructor(props) {
        super();
        this.state = store.getState();
        let token = localStorage.getItem('jwtToken');
        if (!token) return;
        setAuthToken(token);
        Axios.get('/profile')
            .then(res => {
                store.dispatch({
                    type: SET_CURRENT_USER,
                    payload: jwtDecode(token)
                });
            })
            .catch(err => {
                localStorage.removeItem('jwtToken');
            });
    }

    render() {
        let storeData = store.getState();
        return (
            <Provider store={store}>
                <BrowserRouter>
                    <div className='App'>
                        <Navbar />
                        <div id='body'>
                            <Switch>
                                <Route exact path='/' component={Home} />
                                <Route path='/search' component={Search} />
                                <Route path='/library' component={Library} />
                                <Route path='/login' component={Login} />
                                <Route path='/register' component={Register} />
                            </Switch>
                        </div>
                        <Footer />
                    </div>
                </BrowserRouter>
            </Provider>
        );
    }
}

export default App;
