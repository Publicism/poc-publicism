#Certificates generation process
## Generate via bash script

    - launch  ./scripts/genkey.sh rootPath domain(localhost for example) passphrase RSAbit(4096 default)

## Generate via bash
 
- ##CA
   #### openssl genrsa -des3 -out ca.key
       - Enter pass phrase for ca.key: yourPassPhrase 
       - Verifying - Enter pass phrase for ca.key: yourPassPhrase
    
    
- ##Create Authority Certificate
    #### openssl req -new -x509 -days 365 -key ca.key -out ca.crt
        - Enter pass phrase for ca.key: yourPassPhrase 
        - Country Name (2 letter code) [AU]: UA
        - State or Province Name (Full name) [Some-State]:.
        - Locality Name (eg, city) []:.
        - Organization Name (eg, company) [Internet Wifgits Pty Ltd]:Provectus
        - Organization Unit Name (eg, section)[]:
        - Common Name (e.g. server FQDN or YOUR name) []:.
        - Email Address []:
 - ## Generate server key 
    #### openssl genrsa -out server.key
    
 - ## Generate server cert 
    #### openssl req -new -key server.key -out server.csr
        - Country Name (2 letter code) [AU]: UA
        - State or Province Name (Full name) [Some-State]:.
        - Locality Name (eg, city) []:.
        - Organization Name (eg, company) [Internet Wifgits Pty Ltd]:Provectus
        - Organization Unit Name (eg, section)[]:
        - Common Name (e.g. server FQDN or YOUR name) []:localhost
        - Email Address []:
        - A challenge password []:
        - An optional company name []:
 - ## Sign server cert with self-signed cert
    #### openssl x509 -req -days 365 -in server.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out server.crt
        - Enter pass phrase for ca.key: yourPassPhrase

 - ## Generate client key 
    #### openssl genrsa -out client.key
    
 - ## Generate client cert 
    #### openssl req -new -key client.key -out client.csr
        - Country Name (2 letter code) [AU]: UA
        - State or Province Name (Full name) [Some-State]:.
        - Locality Name (eg, city) []:.
        - Organization Name (eg, company) [Internet Wifgits Pty Ltd]:Provectus
        - Organization Unit Name (eg, section)[]:
        - Common Name (e.g. server FQDN or YOUR name) []:CLIENT
        - Email Address []:
        - A challenge password []:
        - An optional company name []:
 - ## Sign client cert with self-signed cert
    #### openssl x509 -req -days 365 -in client.csr -CA ca.crt -CAkey ca.key -set_serial 01 -out client.crt
        - Enter pass phrase for ca.key: yourPassPhrase
                          
# For testing
#### Set process.env.forNegativeTesting=true for Security Error