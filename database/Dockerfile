FROM postgres:16-alpine

# Installer les outils de développement si nécessaire
RUN apk add --no-cache bash

# Copier les scripts d'initialisation si besoin
# COPY ./init-scripts /docker-entrypoint-initdb.d/

EXPOSE 5432
