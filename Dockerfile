FROM ghcr.io/puppeteer/puppeteer:latest

WORKDIR /home/pptuser/app

COPY --chown=pptruser:pptruser . .

USER pptruser

RUN npm install

CMD ["npm", "start"]
