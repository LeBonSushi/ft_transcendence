FROM postgres:16-alpine

# Installer les outils de développement si nécessaire
RUN apk add --no-cache bash

# Copier les scripts d'initialisation si besoin
# COPY ./init-scripts /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=transv2
ENV POSTGRES_PASSWORD=transv2_password
ENV POSTGRES_DB=transv2

EXPOSE 5432
