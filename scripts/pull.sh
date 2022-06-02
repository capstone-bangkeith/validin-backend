#!/usr/bin/env bash

cd ~/validin-backend
git pull origin main
yarn
yarn build
yarn docker:prod:new
