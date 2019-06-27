# Bank Finance Manager
## 1. Getting started
The things that you need to know when working on Finance Dashboard:
* It’s built on angular CLI. See the commands below to build, run, and test the code
* Deployments are done to the Kubernetes clusters. Check out the section on building and deploying.

## 2. Angular CLI
DT Test Suit is build using Angular CLI. See sections below for details.

### 2.1 Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### 2.2 Build
Run `ng build` to build the project. The build artefacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

### 2.3 Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

Use `ng test --code-coverage` to generate a coverage report.

### 2.4 Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## 3. Building and deploying
With the following commands, you can build a version of HP finance manager and deploy it to kubernetes

Build the docker image and upload it to docker hub:
```
npm run docker-build
```
Deploy the docker image to kubernetes
```
npm run deploy
```

Un-deploy any existing deployments on kubernetes
```
npm run un-deploy
```

### 3.1 Rolling Update

To deploy changes with rolling updates, use the following command
```
kubectl set image deployment/finance-manager-deployment core-banking=docker.io/hgdockerza/finance-manager:1.0.0 -n frontend-internal
```
