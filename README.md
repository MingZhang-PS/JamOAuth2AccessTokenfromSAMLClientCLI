## Introduction

This project is inspired by the JAM official project https://github.com/SAP/SAPJamSampleCode/tree/master/JamOAuth2AccessTokenfromSAMLClientCLI. 
That is a JAVA project which illustrates authentication of the SAP Jam Collaboration API using an OAuth2 access token obtained from a SAML2 bearer assertion.

However, we want to have a nodejs project since we want to have the whole **OAuth2SAMLBearerAssertion** flow implemeneted in nodejs BFF.
node-saml is most important dependency.

## Usage

1. Copy your JAM signing private key into resource folder, overwrite the file private.key.
2. Copy your JAM X509 Certificate into resource folder, overwrite the file cert.pem.
3. Run this project with following arguments provided:
- baseUrl: The base url of the Jam site
- clientKey: Jam OAuth client key
- idpId: Identifier for the SAML trusted IDP
- subjectNameIdFormat: "email" or "unspecified". The "unspecified" is ONLY used for SuccessFactors IDP
- subjectNameId: The identifier for the user. Can be an email address or a unique identifier, depending on the subjectNameIdFormat
