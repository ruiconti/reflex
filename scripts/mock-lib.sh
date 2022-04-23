#!/bin/sh
set -e
if [[ ! -f ./node_modules/react ]]; then
    mkdir -p ./node_modules/react
    echo {\"main\": \"./index.js\"} > ./node_modules/react/package.json
    cat ./lib/react/index.ts
    ln -s ./lib/react/index.ts ./node_modules/react/index.js
    cat ./node_modules/react/index.js
fi
if [[ ! -f ./node_modules/react-dom ]]; then
    mkdir -p ./node_modules/react-dom
    cat ./lib/react-dom/index.ts
    ln -s ./lib/react-dom/index.ts ./node_modules/react-dom/index.js
    cat ./node_modules/react-dom/index.js
    echo {\"main\": \"./index.js\"} > ./node_modules/react-dom/package.json
fi