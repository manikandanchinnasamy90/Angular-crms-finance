#!/bin/bash
set -e

function echoBold () {
    echo $'\e[1m'"${1}"$'\e[0m'
}
docker login

echoBold 'Build docker image...'
docker build -t hgdockerza/finance-manager:master -t hgdockerza/finance-manager:$1 -f dockerfile .

echoBold 'Push image to docker hub...'
docker push hgdockerza/finance-manager:master
docker push hgdockerza/finance-manager:$1