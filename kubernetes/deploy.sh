#!/bin/bash

function echoBold () {
    echo $'\e[1m'"${1}"$'\e[0m'
}

echoBold 'Deploying services...'
kubectl create -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-service.yaml

echoBold 'Deploying web app...'
kubectl create -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-deployment.yaml

echoBold 'Deploying ingress...'
kubectl create -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-ingress.yaml