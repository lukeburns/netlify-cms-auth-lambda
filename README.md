# Netlify CMS Github Authentication
This library exposes https://github.com/vencax/netlify-cms-github-oauth-provider as an AWS Lambda function.  Deployment is managed via the serverless.com utilities

To deploy, you'll need the [Serverless Framework](https://serverless.com/framework/docs/providers/aws/guide/installation/) installed. You'll also need your environment configured with [AWS credentials](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Create an SSL Certificate that will be used to secure communication with the service: <https://serverless-stack.com/chapters/setup-ssl.html> is a good guide.  You can ignore steps after "Update CloudFront Distributions with Certificate".  We will be using the serverless-domain-manager to automate these tasks.  

Finally, you will need to install the serverless-domain-manager  so you can use a custom domain for the service.
```console
npm install serverless-domain-manager --save-dev
```
More information on the domain manager can be found at <https://serverless.com/blog/serverless-api-gateway-domain/>.  This also contains info on SSL Certificate creation.

After Installing the Serverless Framework and configuring AWS credentials as noted above, update the serverless.yml file:

1. Set the appropriate environmental variables:
    * `NODE_ENV`: production
    * `OAUTH_CLIENT_ID`: OAUTH_CLIENT_ID_FROM_GITHUB-https://github.com/settings/developers
    * `OAUTH_CLIENT_SECRET`: OAUTH_CLIENT_SECRET_FROM_GITHUB-https://github.com/settings/developers
    * `REDIRECT_URL`: ServiceEndpoint_CNAME  
    `AUTH_TARGET` and `NODE_ENV` should remain as is.
    For example
        ```yaml
        functions:
        app:
            handler: index.handler
            environment:
            NODE_ENV: production
            OAUTH_CLIENT_ID: afa7261a6969345088ea
            OAUTH_CLIENT_SECRET: 32b0914de969695zcf0a553d33484ff22f65be4c
            REDIRECT_URL: https://auth.companyname.com/callback
            AUTH_TARGET: _blank
            events:
                - http: ANY /
                - http: 'ANY {proxy+}'
        ```
1. Update the configuration for the serverless domain manager. Specifically:  
    *  `domainName`: set to the domain name you will be using.  Make sure this matches the SSL certificate that you created above.
    *  `createRoute53Record` If you are using Route 53 for DNS, set this to true.  If you are using another registrar, leave as false and plan on creating/updating a cname pointer to refer to the API distribution that `sls create_domain` creates. The distribution name can be determined by selecting `Custom Domain Names` in the left menu in the Amazon API Gateway Admin Console. An example of the file follows:
        ```yaml   
        plugins:
        - serverless-domain-manager
        custom:
        customDomain:
            domainName: auth.companyname.com
            basePath: 'prod'
            stage: ${self:provider.stage}
            createRoute53Record: false
            # Route53 is false for now.

        ```
    Note: Although AWS does charge to host DNS on Route 53, Route 53 is definitely the easier way to go here...
1. Run `sls create_domain` to create the custom domain:
   ```command
   $ sls create_domain
   Serverless: Skipping creation of Route53 record.
   Serverless: 'auth.companyname.com' was created/updated. New domains may take up to 40 minutes to be initialized.
   ```
   The creating of the new domain will likely take about 10-15 minutes to be configured (or up to 40 minutes).  You can monitor this by looking for the distribution name can be determined by selecting `Custom Domain Names` in the left menu in the Amazon API Gateway Admin Console.
1. Run `sls deploy` to deploy:
   ```command
    $ sls deploy
    Serverless: WARNING: Missing "tenant" and "app" properties in serverless.yml. Without these properties, you can not publish the service to the Serverless Platform.
    Serverless: Packaging service...
    Serverless: Excluding development dependencies...
    Serverless: Uploading CloudFormation file to S3...
    Serverless: Uploading artifacts...
    Serverless: Uploading service .zip file to S3 (2.66 MB)...
    Serverless: Validating template...
    Serverless: Updating Stack...
    Serverless: Checking Stack update progress...
    ..............
    Serverless: Stack update finished...
    Service Information
    service: netlify-cms-auth
    stage: prod
    region: us-east-1
    stack: netlify-cms-auth-prod
    api keys:
    None
    endpoints:
    ANY - https://<ID>.execute-api.us-east-1.amazonaws.com/prod
    ANY - https://<ID></ID>.execute-api.us-east-1.amazonaws.com/prod/{proxy+}
    functions:
    app: netlify-cms-auth-prod-app
    layers:
    None
    Serverless Domain Manager Summary
    Distribution Domain Name
    <DISTRIB>.cloudfront.net
   ```
1. Test by pointing a browser at `auth.companyname.com`
1. Integrate in with your netlify CMS

## Removal
You can remove the stack by running: `sls remove`
## Things not to do:
* Do not upgrade the version of simple-oauth2 by installing the latest while setting up from scratch; it won't work.








