import React, { Component } from 'react';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarToggler, MDBCollapse, MDBNavbarNav, MDBNavItem, MDBNavLink } from 'mdbreact';

class Navbar extends Component {
    state = {
        isOpen: true
    };

    toggleCollapse = () => {
        this.setState({ isOpen: !this.state.isOpen });
    };

    render() {
        return (
            <MDBNavbar color='stylish-color' expand='md' dark fixed='top' scrolling>
                <MDBNavbarBrand href='/'>
                    <strong className='white-text'>Library Management System</strong>
                </MDBNavbarBrand>
                <MDBNavbarToggler onClick={this.toggleCollapse} />
                <MDBCollapse id='navbarCollapse' isOpen={this.state.isOpen} navbar>
                    <MDBNavbarNav left>
                        <MDBNavItem className='ml-3'>
                            <MDBNavLink to='/'>Home</MDBNavLink>
                        </MDBNavItem>
                        <MDBNavItem className='ml-3'>
                            <MDBNavLink to='/search'>Search</MDBNavLink>
                        </MDBNavItem>
                        <MDBNavItem className='ml-3'>
                            <MDBNavLink to='/library'>Library</MDBNavLink>
                        </MDBNavItem>
                    </MDBNavbarNav>
                    <MDBNavbarNav className='mr-5' right>
                        <MDBNavItem className='mr-3'>
                            <MDBNavLink to='/login'>Login</MDBNavLink>
                        </MDBNavItem>
                        <MDBNavItem className='mr-3'>
                            <MDBNavLink to='/register'>Register</MDBNavLink>
                        </MDBNavItem>
                    </MDBNavbarNav>
                </MDBCollapse>
            </MDBNavbar>
        );
    }
}

export default Navbar;
