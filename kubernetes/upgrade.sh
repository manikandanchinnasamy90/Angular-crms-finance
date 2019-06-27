#!/bin/bash

function echoBold () {
    echo $'\e[1m'"${1}"$'\e[0m'
}

echoBold 'Deploying services...'
kubectl replace -f kubernetes-service.yaml

echoBold 'Deploying web app...'
kubectl replace -f kubernetes-deployment.yaml

echoBold 'Deploying ingress...'
kubectl replace -f kubernetes-ingress.yaml
