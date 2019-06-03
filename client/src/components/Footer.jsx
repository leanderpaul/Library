import React from 'react'
import { MDBFooter } from 'mdbreact'

const Footer = () => {
    return (
        <MDBFooter color="special-color-dark">
            <p className="footer-copyright mb-0 py-3 text-center">
                &copy; {new Date().getFullYear()} Copyright: <a href="/"> ShadowKingdom </a>
            </p>
        </MDBFooter>
    )
}

export default Footer