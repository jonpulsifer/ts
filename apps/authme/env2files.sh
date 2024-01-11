#!/usr/bin/env bash

set -euo pipefail

if [ -z "${SERVER_CA:-}" ] || [ -z "${CLIENT_IDENTITY_PKCS12:-}" ]; then
  echo "ERROR: One or more required environment variables are not set."
  exit 1
fi

# Decode them from base64, only if the files don't exist
if [ ! -f /tmp/server-ca.pem ]; then
  echo "${SERVER_CA}" | base64 -d > /tmp/server-ca.pem
fi

if [ ! -f /tmp/client-identity.p12 ]; then
  echo "${CLIENT_IDENTITY_PKCS12}" | base64 -d > /tmp/client-identity.p12
fi
