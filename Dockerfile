FROM node:alpine

RUN mkdir -p /usr/src/theme-based-roadmap-with-trello-app && chown -R node:node /usr/src/theme-based-roadmap-with-trello-app

WORKDIR /usr/src/theme-based-roadmap-with-trello-app

COPY package.json yarn.lock ./

USER node

RUN yarn install --pure-lockfile

COPY --chown=node:node . .

EXPOSE 3000
