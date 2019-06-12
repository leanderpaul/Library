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
    -   Does not store identities therefore no breach in security Uses public
    -   key infrastructure to protect asserted identities
-   User Experience
    -   User's access multiple applications with a single set of credentials entered once

## SAML Protocols

SAML defines a number of request/response protocols. These protocols allow service providers to:

-   request or query for an assertion
-   ask for a subject to be authenticated
-   create and manage name identifier mappings (for federating identities through account linking)
-   request a near-simultaneous logout of a collection of related sessions ("single logout")

The protocol is encoded in an XML schema as a set of request-response pairs. The protocols defined are.

### Assertion Query and Request Protocol:

    Defines a set of queries by which existing SAML assertions may be obtained. The query can be on the basis of a reference, subject or the statement type.

### Authentication Request Protocol:

    Defines a <AuthnRequest> message that causes a <Response> to be returned containing one of more assertions pertaining to a Principal. Typically the <AuthnRequest> is issued by a Service Provider with the Identity Provider returning the <Response> message. Used to support the Web Browser SSO Profile.

### Artifact Protocol:

    Provides a mechanism to obtain a previously created assertion by providing a reference. In SAML terms the reference is called an “artifact”. Thus a SAML protocol can refer to an assertion by an artifact, and then when a Service Provider obtains the artifact it can use the artifact Protocol to obtain the actual assertion using this protocol.

### Name Identifier Management Protocol:

    Provides mechanisms to change the value or format of the name of a Principal. The issuer of the request can be either the Service Provider or the Identity Provider. The protocol also provides a mechanism to terminate an association of a name between an Identity Provider and Service Provider.

### Single Logout Protocol:

    Defines a request that allows near-simultaneous logout of all sessions associated by a Principal. The logout can be directly initiated by the Principal or due to a session timeout.

### Name Identifier Mapping Protocol:

    Provides a mechanism to enable “account linking”. Refer to the subsequent sections on Federation.

## SAML Assertions

An assertion consists of one or more statements. For single sign-on, a typical SAML assertion will contain a single authentication statement and possibly a single attribute statement. Note that a SAML response could contain multiple assertions, although its more typical to have a single assertion within a response.

### Authentication

    The specified subject was authenticated by a particular means at a particular time. This kind of statement is typically generated by a SAML authority called an identity provider, which is in charge of authenticating users and keeping track of other information about them.

### Attribute

    The specified subject is associated with the supplied attributes.

### Authorization decision

    A request to allow the specified subject to access the specified resource has been granted or denied.

## SAML Bindings

Mappings from SAML request-response message exchanges into standard messaging or communication protocols are called SAML protocol bindings.

The SAML SOAP Binding, for instance, defines how SAML protocol messages can be communicated within SOAP messages, whilst the HTTP Redirect binding defines how to pass protocol messages through HTTP redirection.

## SAML Profiles

Generally, a profile of SAML defines constraints and/or extensions in support of the usage of SAML for a particular application – the goal being to enhance interoperability by removing some of the flexibility inevitable in a general-use standard. For instance, the Web Browser SSO Profile specifies how SAML authentication assertions are communicated between an identity provider and service provider to enable single sign-on for a browser user.

### Web Browser SSO Profile

     Defines how a Web Browser supports SSO, when using <AuthnRequest> protocol messages in combination with HTTP Redirect, HTTP POST and HTTP Artifact bindings

### Enhanced Client and Proxy (ECP) Profile

    Defines how <AuthnRequest> protocol messages are used when combined with the Reverse-SOAP binding (PAOS). Designed to support mobile devices front-ended by a WAP gateway

### Identity Provider Discovery Profile

    Defines how a service provider can discover which identity providers a principal is using with the Web Server

### Single Logout Profile

    A profile of the SAML Single Logout protocol is defined. Defines how SOAP, HTTP Redirect, HTTP POST and HTTP Artifact bindings may be used.

### Name Identifier Management Profile

    Defines how the Name Identifier Management protocol may be used with SOAP, HTTP Redirect, HTTP POST and HTTP Artifact bindings.

### Artifact Resolution Profile

    Defines how the Artifact Resolution protocol uses a synchronous binding, for example the SOAP binding.

### Assertion Query/Request Profile

    Defines how the SAML query protocols (used for obtaining SAML assertions) use a synchronous binding such as the SOAP binding.

### Name Identifier Mapping Profile

    Defines how the Name Identifier Mapping protocol uses a synchronous binding such as the SOAP binding.
