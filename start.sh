#!/bin/bash

# Run JavaScript file
node store/scrape-store-gas-price.js &
node server/server.js &

# Start React server
cd gas-price-tracker  # Assuming your React app is in a directory named "client"
npm start
