const saml20 = require('saml').Saml20;
const fs = require('fs');
const querystring = require('querystring');
const yargs = require('yargs');
const axios = require('axios');

const argv = yargs
    .option('baseUrl', {
        description: 'The base url of the Jam site',
        type: 'string',
    })
    .option('clientKey', {
        description: 'Jam OAuth client key',
        type: 'string',
    })
    .option('idpId', {
        description: 'Identifier for the SAML trusted IDP',
        type: 'string',
    })
    .option('subjectNameIdFormat', {
        description: '"email" or "unspecified"',
        type: 'string',
    })
    .option('subjectNameId', {
        description: 'The identifier for the user. Can be an email address or a unique identifier, depending on the subjectNameIdFormat',
        type: 'string',
    })
    .demandOption(['baseUrl', 'clientKey', 'idpId', 'subjectNameIdFormat', 'subjectNameId'], 'Please provide all arguments to work with this tool')
    .help()
    .alias('help', 'h')
    .argv;

const options = {
  cert: fs.readFileSync(__dirname + '/resource/cert.pem'),
  key: fs.readFileSync(__dirname + '/resource/private.key'),
  issuer: argv.idpId,
  lifetimeInSeconds: 600,
  audiences: 'cubetree.com', //as obtained from SAP Jam docs https://help.sap.com/viewer/u_collaboration_dev_help/fd49d6ed74ab4e54825a843dc20dd63f.html
  recipient: argv.baseUrl + '/api/v1/auth/token', //since token endpoint is the one who is supposed to receive the assertion later on
  attributes: {
    'client_id': argv.clientKey,
  },
  nameIdentifier: argv.subjectNameId,
  nameIdentifierFormat: argv.subjectNameIdFormat === 'email'? 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress': 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  signatureAlgorithm: 'rsa-sha1',
  digestAlgorithm: 'sha1',
};

// TODO: how to add NameQualifier into options for SuccessFactors IDP? node-saml library doesn't support NameQualifier at all!

// create the saml assertion based on given input, and sign it with the idp private key
const signedAssertion = '<?xml version="1.0" encoding="UTF-8"?>\n' + saml20.create(options);
console.log("saml assertion generated: " + signedAssertion);
const signedAsserationBase64 = Buffer.from(signedAssertion).toString('base64');

// saml bearer assertion -> OAuth saml bearer token
const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
};
axios.post(argv.baseUrl + '/api/v1/auth/token', querystring.stringify({ 
    client_id: argv.clientKey,
    grant_type: 'urn:ietf:params:oauth:grant-type:saml2-bearer',
    assertion: signedAsserationBase64
}), config).then( (response) => {
    console.log("token generated: " +  response.data.access_token);
  }).catch((err) => {
    console.error(err);
  });
