#!/bin/bash

# Run JavaScript file
node store/scrape-store-gas-price.js &
node server/server.js &

# Start React server
cd gas-price-tracker
npm start
