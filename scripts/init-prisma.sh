#!/bin/sh
set -e

for service in service-auth service-user service-chat service-game; do
  echo "Migrating $service..."
  cd "$(dirname "$0")/../backend/$service"
npx prisma migrate dev --name init || true
  cd - > /dev/null
  echo "Done: $service"
done
