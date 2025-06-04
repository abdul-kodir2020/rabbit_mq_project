# Étape 1 : Build de l'app
FROM node:20-alpine AS build

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers de dépendances
COPY package.json package-lock.json ./


ARG REACT_APP_BACKEND_URL
ARG REACT_APP_WS_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_WS_URL=$REACT_APP_WS_URL

# Installer les dépendances
RUN npm install

# Copier tout le reste (code source, .env, etc.)
COPY . .

# Construire l'application pour la prod
RUN npm run build

# Étape 2 : Serveur NGINX pour servir les fichiers
FROM nginx:stable-alpine

# Copier les fichiers de build dans le dossier NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Copier la config nginx si besoin (optionnel)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer le port par défaut de NGINX
EXPOSE 80

# Lancer NGINX
CMD ["nginx", "-g", "daemon off;"]
