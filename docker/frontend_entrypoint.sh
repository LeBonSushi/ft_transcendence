#!/bin/bash

set -e

DOMAIN="travel_planner.com"
CA_DIR="/ssl/ca"
SERVER_DIR="/ssl/server"
EXT_DIR="/ssl/extensions"
DH_PARAM_DIR="/etc/ssl/nginx"

mkdir -p "$CA_DIR" "$SERVER_DIR" "$EXT_DIR" "$DH_PARAM_DIR"

# 3. Generate the server private key
#    - 'ssl/server/travel_planner-server.key': RSA 4096-bit private key for the server
#    - Used to encrypt HTTPS traffic
openssl genrsa -out "$SERVER_DIR/travel_planner-server.key" 4096

# 4. Generate the Certificate Signing Request (CSR)
#    - 'ssl/server/travel_planner-server.csr': CSR containing the server's info
#    - SAN extensions are defined separately in san.ext (step 5)
openssl req -new \
  -key "$SERVER_DIR/travel_planner-server.key" \
  -out "$SERVER_DIR/travel_planner-server.csr" \
  -subj "/CN=$DOMAIN/O=TravelPlanner/C=FR"

# 5. Create the SAN extensions file
#    - 'ssl/extensions/san.ext': extensions to embed in the final certificate
#    - basicConstraints=CA:FALSE : this is a server cert, not a CA
#    - keyUsage : allowed cryptographic uses for this certificate
#    - extendedKeyUsage=serverAuth : explicitly marks this cert for HTTPS use
#    - subjectAltName : list of domains covered (required by modern browsers)
cat > "$EXT_DIR/san.ext" << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage=digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage=serverAuth
subjectAltName=DNS:$DOMAIN,DNS:www.$DOMAIN
EOF

# 6. Sign the server certificate with the CA
#    - 'ssl/server/travel_planner-server.crt': final signed certificate for nginx
#    - SAN extensions from san.ext are embedded into the final certificate
#    - CAcreateserial/CAserial : manages serial numbers for renewals
#    - Valid for 365 days
openssl x509 -req \
  -in "$SERVER_DIR/travel_planner-server.csr" \
  -CA "$CA_DIR/travel_planner-ca.crt" \
  -CAkey "$CA_DIR/travel_planner-ca.key" \
  -CAcreateserial \
  -CAserial "$CA_DIR/travel_planner-ca.srl" \
  -days 365 \
  -extfile "$EXT_DIR/san.ext" \
  -out "$SERVER_DIR/travel_planner-server.crt"

HOSTNAME=0.0.0.0 PORT=3000 node apps/web/server.js &
NODE_PID=$!

echo "Waiting for Next.js to start..."
sleep 5

nginx -t

if [ $? != 0 ]; then
	echo -e "Nginx configuration failed to pass the test\n"
	kill $NODE_PID
	exit 1;
fi

exec nginx -g "daemon off;"