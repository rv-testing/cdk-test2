# cdk-test2

This repository now contains an AWS CDK (TypeScript) conversion of
`s3_lambda_trigger.json`.

## What It Creates

- A Lambda function (`S3TriggerLambdaFunction`) using inline Python code
- A dedicated Lambda IAM role (`LambdaIAMRole`) with CloudWatch Logs permissions
- An S3 bucket (`S3BucketNotification`) with:
  - Server-side encryption (SSE-S3 / AES256)
  - Public access blocks enabled
  - Notification for `s3:ObjectCreated:Put` to invoke the Lambda

## Files Added

- `bin/cdk-test2.ts`
- `lib/s3-lambda-trigger-stack.ts`
- `package.json`
- `cdk.json`
- `tsconfig.json`

## Deploy

1. Install dependencies:

	```bash
	npm install
	```

2. (First time only) bootstrap your environment:

	```bash
	npx cdk bootstrap
	```

3. Synthesize the template:

	```bash
	npm run synth -- --parameters NotificationBucket=<your-bucket-name>
	```

4. Deploy:

	```bash
	npm run deploy
	```

5. Optional: set a fixed bucket name when you want one:

	```bash
	npm run deploy -- -c notificationBucketName=<your-bucket-name>
	```

## Environments: dev, qa, prod

The app now synthesizes three stacks by default:

- `S3LambdaTriggerStack-dev`
- `S3LambdaTriggerStack-qa`
- `S3LambdaTriggerStack-prod`

You can configure each environment independently with CDK context values:

- `<env>Account`
- `<env>Region`
- `<env>NotificationBucketName`

Examples:

```bash
npx cdk synth \
	-c devAccount=111111111111 \
	-c devRegion=us-east-1 \
	-c devNotificationBucketName=my-dev-notification-bucket \
	-c qaAccount=222222222222 \
	-c qaRegion=us-east-2 \
	-c qaNotificationBucketName=my-qa-notification-bucket \
	-c prodAccount=333333333333 \
	-c prodRegion=us-west-2 \
	-c prodNotificationBucketName=my-prod-notification-bucket
```

If account/region values are not provided for an environment, the app falls
back to `CDK_DEFAULT_ACCOUNT` and `CDK_DEFAULT_REGION`.

## About `policy.json`

`policy.json` appears to be a caller/deployer IAM policy (permissions like
`iam:CreateRole`, `lambda:*`, and `s3:*`) rather than a runtime policy for the
Lambda function itself.

The converted CDK stack does not need to attach this broad policy to the Lambda
execution role, because the function only logs the event. Use `policy.json` for
the IAM identity that runs `cdk deploy` if your account requires those rights.

## Diff Behavior

`cdk diff --method=change-set` was failing because CloudFormation change sets do
not allow missing required parameter values. The stack now avoids that required
parameter, so `cdk diff` works without passing `NotificationBucket`.

`--method=change-set` still requires AWS credentials and a resolvable target
account/region. The app now uses `CDK_DEFAULT_ACCOUNT` and
`CDK_DEFAULT_REGION` when the CDK CLI provides them.
