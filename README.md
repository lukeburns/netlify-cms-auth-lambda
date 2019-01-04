# Netlify CMS Github Authentication

This library exposes https://github.com/vencax/netlify-cms-github-oauth-provider as a lambda service.

## Usage

#### As a library

```
npm i netlify-cms-github-lambda
```

AWS Lambda example using [serverless-http](netlify-cms-github-lambda):

```js
// handler.js
const serverless = require('serverless-http')
const app = require('netlify-cms-github-lambda')
module.exports = serverless(app)
```

This repository includes this for convenience in `handler.js`, which you can use as a Serverless service as described below, but you might also wish to consume this library as an Express app to deploy using a different framework or on a different cloud platform. Make sure you [configure your production environment](https://github.com/vencax/netlify-cms-github-oauth-provider#2-config) appropriately.

#### As a Serverless AWS Lambda service

1. Clone this repository
  ```
  git clone https://github.com/lukeburns/netlify-cms-github-lambda
  ```
1. Install dependencies
  ```
  npm i
  ```
1. Configure your [local Serverless and AWS environment](https://serverless.com/framework/docs/providers/aws/guide/installation/)

1. Configure your production environment

  The following Serverless configuration will prepare an authentication server for Github on AWS Lambda and API Gateway. You can also configure for use with another provider, like Gitlab. To do this, see configuration details in the original library: [vencax/netlify-cms-github-oauth-provider](https://github.com/vencax/netlify-cms-github-oauth-provider#2-config).

  ```yaml
  # serverless.yml
  service: netlify-cms-auth

  provider:
    name: aws
    runtime: nodejs8.10
    stage: prod
    region: us-east-1

  functions:
    app:
      handler: handler.handler
      environment:
        NODE_ENV: production
        OAUTH_CLIENT_ID: # get from https://github.com/settings/developers
        OAUTH_CLIENT_SECRET: # get from https://github.com/settings/developers
      events:
        - http: ANY /
        - http: 'ANY {proxy+}'
  ```

  This is also where you can prepare additional Serverless configuration, such as a [custom domain](https://serverless.com/blog/serverless-api-gateway-domain/).

1. Deploy with the Serverless CLI

  ```
  sls deploy
  ```

  Your authentication server should now be running, e.g. at https://id.execute-api.us-east-1.amazonaws.com/prod.

1. Configure Netlify CMS

  For instance, the following backend configuration is what you'll need to if you deploy to AWS without a custom domain.

  ```yaml
  # config.yml
  backend:
    name: github
    repo: username/repo
    branch: master
    base_url: https://id.execute-api.us-east-1.amazonaws.com
    auth_endpoint: /prod/auth
  ```

  Note, if you deploy via AWS to https://id.execute-api.us-east-1.amazonaws.com/prod, make sure you set `base_url` to `https://id.execute-api.us-east-1.amazonaws.com` and `auth_endpoint` to `/prod/auth`. Otherwise, you [may find yourself frustrated](https://github.com/netlify/netlify-cms/issues/1285#issuecomment-451058395).
