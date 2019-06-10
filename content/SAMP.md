# Security Assertion Markup Language

-   It is a standard for authentication and authorization between the identity provider and the service provider.

-   It is XML based.

-   SAML uses SSO - Single-Sign On - a term that means that a user can sign in once and the same credentials can be reused to log into other service providers.

## Uses

-   It simplifies authentication and authorization.

-   Makes it possible to keep the identity provider and service provider exist seperately from eaach other.

-   Secure method of passing user authentication & authorization between the Identity provider and service provider.

## SAML Provider Types

![SAML Provider Types](resources/SamlTypes.png 'Types of SAML Providers')

A SAML provider is a system that helps a user access a service they need. There are two primary types of SAML providers, service provider, and identity provider.

A service provider needs the authentication from the identity provider to grant authorization to the user.

An identity provider performs the authentication that the end user is who they say they are and sends that data to the service provider along with the user’s access rights for the service.

An Example of identity provider would be [OneLogin](https://www.onelogin.com/)
An Example of service provider would be [Salesforce](https://www.salesforce.com/in/)

## SAML Flow

![SAML Flow](resources/SamlFlow.png 'SAML Flow')

1. You try to access the resource on the server, which in SAML terminology is a service provider. The service provider in turn checks to see if you're already authenticated within the system. If you are, you skip to step 7; if you're not, the service provider starts the authentication process.

2. The service provider determines the appropriate identity provider for you and redirects you to that provider — in this case, the single sign-on service.

3. Your browser sends an authentication request to the SSO service; the service then identifies you.

4. The SSO service returns an XHTML document, which includes the authentication information needed by the service provider in a SAMLResponse parameter.

5. The SAMLResponse parameter is passed on to the service provider.

6. The service provider processes this response and creates a security context for you — basically, it logs you in — and then tells you where your requested resource is.

7. With this information, you can now request the resource you're interested in again.

8. The resource is finally returned to you!

There's no explanation of how SAML knows what the appropriate identity provider is, or how the identity provider determines that you're who you say you are. This is because the SAML standard doesn't define how these things happen, leaving IT lots of leeway on how to set things up.

[SAMP Response Examples](https://www.samltool.com/generic_sso_res.php)

## Why use SAML

SAML is used mainly for the following three benefits that it offers

-   Standard
    -   Designed to work well with any system independent of impementation.
    -   Open approach without any interoperability issues associated with vendor-specific approaches.
-   Security
-   User Experience
