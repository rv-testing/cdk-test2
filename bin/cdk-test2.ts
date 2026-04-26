#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as process from 'node:process';
import { S3LambdaTriggerStack } from '../lib/s3-lambda-trigger-stack';

const app = new cdk.App();
const notificationBucketName = app.node.tryGetContext('notificationBucketName');

new S3LambdaTriggerStack(app, 'S3LambdaTriggerStack', {
	env: {
		account: process.env.CDK_DEFAULT_ACCOUNT,
		region: process.env.CDK_DEFAULT_REGION,
	},
	notificationBucketName,
});
