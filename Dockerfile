FROM node:latest

ENV DIR /usr/src/app

WORKDIR $DIR

COPY . $DIR
RUN npm install

EXPOSE 8001
CMD ["npm", "start"]
