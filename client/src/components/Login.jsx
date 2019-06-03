import React from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, toast, ToastContainer } from 'mdbreact';
import { connect } from 'react-redux';

import { loginUser } from '../store/actions';
import isEmpty from '../utils/isEmpty';

class Login extends React.Component {
    state = {
        username: '',
        password: '',
        isValid: false,
        validationErrors: []
    };

    onChange = e => {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        });
    };

    handleValidation = e => {
        let errors = [];
        if (isEmpty(this.state.username)) errors.push('Username cannot be empty !');
        if (isEmpty(this.state.password)) errors.push('Password cannot be empty !');
        if (errors.length === 0) return this.setState({ ...this.state, isValid: true });
        this.setState({ ...this.state, validationErrors: errors });
    };

    onSubmit = async e => {
        e.preventDefault();
        await this.handleValidation();
        if (this.state.isValid) return this.props.loginUser(this.state);
        this.state.validationErrors.forEach(error => toast.error(error));
    };

    componentWillReceiveProps(nextProps) {
        let msg = nextProps.feedback.msg;
        if (nextProps.feedback.success === false) toast.error(msg);
    }

    render() {
        if (this.props.auth.isAuthenticated) return <Redirect to='/' />;

        return (
            <MDBContainer style={{ 'padding-top': '200px' }}>
                <ToastContainer position='top-center' />
                <MDBRow>
                    <MDBCol md='6' className='mx-auto m-3'>
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={this.onSubmit}>
                                    <p className='h4 text-center py-4'>SIGN IN</p>
                                    <div className='grey-text'>
                                        <MDBInput
                                            label='Username'
                                            icon='user'
                                            group
                                            value={this.state.username}
                                            type='text'
                                            noValidate
                                            name='username'
                                            onChange={this.onChange}
                                        />
                                        <MDBInput
                                            label='Password'
                                            icon='lock'
                                            group
                                            value={this.state.password}
                                            type='password'
                                            noValidate
                                            name='password'
                                            onChange={this.onChange}
                                        />
                                    </div>
                                    <div className='text-center py-4 mt-3'>
                                        <MDBBtn color='cyan' type='submit'>
                                            Login
                                        </MDBBtn>
                                    </div>
                                    <div className='grey-text text-center'>
                                        <p className='flow-text'>
                                            Don't have an Account? <Link to='/register'>Sign Up</Link>
                                        </p>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        );
    }
}

Login.propTypes = {
    loginUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    feedback: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    feedback: state.feedback
});

export default connect(
    mapStateToProps,
    { loginUser }
)(Login);
