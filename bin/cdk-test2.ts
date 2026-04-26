#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { S3LambdaTriggerStack } from '../lib/s3-lambda-trigger-stack';

const app = new cdk.App();

new S3LambdaTriggerStack(app, 'S3LambdaTriggerStack');
