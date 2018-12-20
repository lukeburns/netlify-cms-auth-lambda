# Netlify CMS Github Authentication
This library exposes https://github.com/vencax/netlify-cms-github-oauth-provider as an AWS Lambda function.  

Prior to attempting to dploy, it is recommended that you have the AWS CLI utilities installed to ensure your account is configured with AWS via API keys: <https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html>
1. To deploy:
    ```console
    $ npm run config -- --account-id="<AWSACCOUNTID>" --bucket-name="<bucketForCFTemplates>" --region="us-east-1" --function-name="netlifyAuth"
    ```
    This modifies `package.json`, `simple-proxy-api.yaml` and `cloudformation.yaml` with your account ID, bucket, region and function name (region defaults to `us-east-1` and function name defaults to `AwsServerlessExpressFunction`). If the bucket you specify does not yet exist, the next step will create it for you. This step modifies the existing files in-place; if you wish to make changes to these settings, you will need to modify `package.json`, `simple-proxy-api.yaml` and `cloudformation.yaml` manually. (See <https://github.com/awslabs/aws-serverless-express/tree/master/examples/basic-starter> for more info.)  
    **Note:** This doesn't seem to do a great job reconfiguring after configuring files when run the first time.  If you want to need to change function names, regions, etc after running, it is likely easiest to manually edit the files listed above.
1. Run:
    ```console
    $ npm run setup #Mac, Linux, Bash
    -or-
    $ npm run win-setup #Windows
    ```
    This installs the node dependencies, creates an S3 bucket (if it does not already exist), packages and deploys your serverless Express application to AWS Lambda, and creates an API Gateway proxy API.
1. After the setup command completes, open the AWS CloudFormation console <https://console.aws.amazon.com/cloudformation/home> and switch to the region you specified. Select the `netflifyAuth` stack, then click the ApiUrl value under the Outputs section - this will open a new page with your running API. The API index lists the resources available in the example Express server (app.js), along with example curl commands.
1. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the config command for step 1 and want to delete that bucket, run `npm run delete-bucket`.