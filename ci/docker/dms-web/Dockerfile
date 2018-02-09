FROM birgerk/angular-cli

# Copy project
WORKDIR blockchain_poc
COPY ./dms ./dms
COPY ./web ./web
COPY ./protos ./protos

# Setup project
RUN npm --prefix ./dms install ./dms
RUN npm --prefix ./web install ./web
RUN cd ./web && ng build
RUN cd ..

# Expose ports
EXPOSE 8080

# Run app
CMD ["node", "dms/app.js"]