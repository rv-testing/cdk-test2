#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import * as process from 'node:process';
import { S3LambdaTriggerStack } from '../lib/s3-lambda-trigger-stack';

const app = new cdk.App();

const environments = ['dev', 'qa', 'prod'] as const;

for (const environment of environments) {
	const notificationBucketName = app.node.tryGetContext(`${environment}NotificationBucketName`);
	const account = app.node.tryGetContext(`${environment}Account`) ?? process.env.CDK_DEFAULT_ACCOUNT;
	const region = app.node.tryGetContext(`${environment}Region`) ?? process.env.CDK_DEFAULT_REGION;

	new S3LambdaTriggerStack(app, `S3LambdaTriggerStack-${environment}`, {
		env: {
			account,
			region,
		},
		notificationBucketName,
	});
}
