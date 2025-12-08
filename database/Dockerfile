FROM postgres:16-alpine

# Installer les outils de développement si nécessaire
RUN apk add --no-cache bash

# Copier les scripts d'initialisation si besoin
# COPY ./init-scripts /docker-entrypoint-initdb.d/

ENV POSTGRES_USER=trans
ENV POSTGRES_PASSWORD=trans_password
ENV POSTGRES_DB=trans

EXPOSE 5432
