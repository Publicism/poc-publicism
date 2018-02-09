#AKM Server setup
Before start of project to change /etc/akm/akm.conf

    [cert]
    PCIDSSNode = Y change to N

# Project structure
## Constants
Constants are located in constant.js and must be installed in upper level of application

    global = Object.assign(global, require('../constants'));
## Localizations
Locations are located in the localization folders / [lang] / *. json, that are will subsequently be set in the global constant


## Classes

- classes/Configurator.js - configuration class that makes configurations and stores it in memory
- classes/Core.js - core class which include all methods to build main logic 
- classes/ErrorHandler.js - error handler class that catches errors and exceptions
- classes/InterInterface.js - TCP protocol class that makes connection with AKM and do AKMs requests
- classes/ExterInterface.js - class for initial messages for InterInterface.js
- classes/ExterConverter.js - class that converts initial messages to AkmMsgConverter.js messages
- classes/AkmMsgConverter.js - class that converts initial messages to AKM messages
- classes/Validator.js - message validator class
- classes/Routers.js - class for API routers, that located in classes/routers
        
    - ##### version.js 
        - http://[config/[env].json->RESTful.host]:[config/[env].json->RESTful.port]/EXTERNAL_API.ver - returns EXTERNAL_API.version. 
        
    ##### http://localhost:3000/v0.1 -> { version: "v0.1.0" }
    
    - ##### rest.js 
        -  http://[config/[env].json->RESTful.host]:[config/[env].json->RESTful.port]/EXTERNAL_API.ver/[config/schemes/externalAPI/[EXTERNAL_API.ver]/[crudApiList.json -> method].RESTful.schema]
         
     ##### GET http://localhost:3000/v0.1/symmetric-key/abra//B64 -> { [ parsed JSON AKM response ] }

## Configurations
Configurations are making with nconf module and have 4 environments:
- dev.json - for development
- stage.json - for production
- qa.json - for test deployment
- test.json - for testing

#### default.json setup
  "lang":"localizations/en", - setup of localization  for errors and messages.
  "adminRouters":[array] - setup for API routers that sends data to AKM server via admin port.

#### default certificate files:
- AKMRootCACertificate.pem - root certificate
- AKMAdminPrivateKey.pem - admin private key
- AKMAdminCertificate.pem - admin public key
- AKMClientPrivateKey.pem - private key
- AKMClientCertificate.pem - public key

##### Akm api schemes location (depends of constants)
- /internalAPI/schemes/apiList.json - akm api list versions file
- /internalAPI/schemes/[version number]/[number].json - akm api request/response schemes
- /externalAPI/schemes/apiList.json - REST api list versions file
- /externalAPI/schemes/[version number]/[number].json - REST api request/response schemes
##### Schemes features

- "optional": true - disabling validator
- "validation": { "value": [ "BIN", "B16", "B64", "RSA" ] } - validate value form a list 
- "notString": true - disabling convert to string in response parser
- "type":"string" -  enabling type validation

## Unit testing

    $ yarn test
    $ yarn run api-test

# API explorer

http://[config/[env].json->RESTful.host]:[config/[env].json->RESTful.port]/EXTERNAL_API.ver/explorer

##### http://localhost:3000/v0.1/explorer