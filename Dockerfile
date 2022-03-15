FROM node:17-alpine

ENV DB_HOST postgres

RUN mkdir -p /home/app

WORKDIR /home/app

COPY . /home/app

EXPOSE 3000

CMD ["npm", "start"];