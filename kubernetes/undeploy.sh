#/bin/bash

function echoBold () {
    echo $'\e[1m'"${1}"$'\e[0m'
}

echoBold 'Un-Deploying  services...'
kubectl delete -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-service.yaml

echoBold 'Un-Deploying web app...'
kubectl delete -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-deployment.yaml

echoBold 'Un-Deploying ingress...'
kubectl delete -f "$( dirname "${BASH_SOURCE[0]}" )"/kubernetes-ingress.yaml