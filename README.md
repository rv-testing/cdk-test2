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
	npm run deploy -- --parameters NotificationBucket=<your-bucket-name>
	```

## About `policy.json`

`policy.json` appears to be a caller/deployer IAM policy (permissions like
`iam:CreateRole`, `lambda:*`, and `s3:*`) rather than a runtime policy for the
Lambda function itself.

The converted CDK stack does not need to attach this broad policy to the Lambda
execution role, because the function only logs the event. Use `policy.json` for
the IAM identity that runs `cdk deploy` if your account requires those rights.
