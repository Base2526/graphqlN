# stage: 1
FROM node:12
WORKDIR /app
COPY . /app
# RUN npm install 

# RUN rm -rf node_modules

RUN npm install -g nodemon
RUN npm install -g ts-node

# RUN npm run build

# CMD ["node", "index.js"]
CMD [ "npm", "start" ]
# CMD [ "npm", "run", "dev" ]