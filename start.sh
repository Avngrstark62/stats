#!/bin/bash

pm2 delete backend 2>/dev/null
pm2 delete frontend 2>/dev/null

cd backend || exit
pm2 start "node index.js" --name backend

cd ../frontend || exit
pm2 start "npm run dev" --name frontend

pm2 status
