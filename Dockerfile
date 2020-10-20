FROM node:alpine

ENV TELEGRAM_TOKEN "1241341857:AAGvMm0J8MPU8Wg9wNhmhaHmpFnGv-tsMlY"
ENV ACCOUNTING_DIR "/var/accounting"
ENV JOURNAL_FILE "$ACCOUNTING_DIR/journal.dat"

RUN apk update && \
apk add inotify-tools git

RUN mkdir -p /var/app/
RUN git clone git@github.com:heydemoura/accounting.git $ACCOUNTING_DIR

CMD ['npm run dev']
