import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, toast, ToastContainer } from 'mdbreact';
import { connect } from 'react-redux';

import { registerUser } from '../store/actions';
import isEmpty from '../utils/isEmpty';

class Register extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        isValid: false,
        validationErrors: []
    };

    handleValidation = () => {
        let errors = [];
        if (isEmpty(this.state.username)) errors.push('Username cannot be empty !');
        if (isEmpty(this.state.email)) errors.push('Email cannot be empty !');
        if (isEmpty(this.state.password)) errors.push('Password cannot be empty !');
        if (isEmpty(this.state.confirmPassword)) errors.push('Confirm password cannot be empty');
        if (this.state.password !== this.state.confirmPassword) errors.push('Password and confirm password do not match !');
        if (errors.length === 0) return this.setState({ ...this.state, isValid: true });
        this.setState({ ...this.state, validationErrors: errors });
    };

    onChange = e => {
        this.setState({
            ...this.state,
            [e.target.name]: e.target.value
        });
    };

    componentWillReceiveProps(nextProps) {
        let msg = nextProps.feedback.msg;
        if (nextProps.feedback.success) {
            this.setState({
                username: '',
                email: '',
                password: '',
                confirmPassword: ''
            });
            toast.success(msg);
        } else toast.error(msg);
    }

    onSubmit = async e => {
        e.preventDefault();
        await this.handleValidation();
        if (this.state.isValid) return this.props.registerUser(this.state);
        this.state.validationErrors.forEach(error => toast.error(error));
    };

    render() {
        if (this.props.auth.isAuthenticated) return <Redirect to='/' />;

        return (
            <MDBContainer style={{'padding-top': '150px'}}>
                <ToastContainer position='top-center' />
                <MDBRow>
                    <MDBCol md='6' className='mx-auto'>
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={this.onSubmit}>
                                    <p className='h4 text-center py-4'>SIGN UP</p>
                                    <div className='grey-text'>
                                        <MDBInput
                                            label='Username'
                                            icon='user'
                                            value={this.state.username}
                                            name='username'
                                            onChange={this.onChange}
                                            group
                                            type='text'
                                            noValidate
                                        />
                                        <MDBInput
                                            label='Email'
                                            icon='envelope'
                                            value={this.state.email}
                                            name='email'
                                            onChange={this.onChange}
                                            group
                                            type='email'
                                            noValidate
                                        />
                                        <MDBInput
                                            label='Password'
                                            icon='lock'
                                            value={this.state.password}
                                            name='password'
                                            onChange={this.onChange}
                                            group
                                            type='password'
                                            validate
                                        />
                                        <MDBInput
                                            label='Confirm password'
                                            icon='lock'
                                            value={this.state.confirmPassword}
                                            name='confirmPassword'
                                            onChange={this.onChange}
                                            group
                                            type='password'
                                            validate
                                        />
                                    </div>
                                    <div className='text-center py-4 mt-3'>
                                        <MDBBtn color='cyan' type='submit'>
                                            Register
                                        </MDBBtn>
                                    </div>
                                    <div className='grey-text text-center'>
                                        <p className='flow-text'>
                                            Already have an Account? <Link to='/login'>Sign In</Link>
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

Register.propTypes = {
    registerUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    feedback: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    auth: state.auth,
    feedback: state.feedback
});

export default connect(
    mapStateToProps,
    { registerUser }
)(Register);
