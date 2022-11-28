FROM node:16-alpine
COPY ./src /home/node/app/src
COPY package.json /home/node/app
RUN chown -R node:node /home/node/app/
WORKDIR /home/node/app/
USER node
RUN npm install
CMD ["npm", "start"]