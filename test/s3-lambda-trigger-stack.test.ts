import assert = require('node:assert/strict');
import test = require('node:test');
import * as cdk from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';

import { S3LambdaTriggerStack } from '../lib/s3-lambda-trigger-stack';

test('stack creates the lambda, bucket, and notification configuration', () => {
  const app = new cdk.App();
  const stack = new S3LambdaTriggerStack(app, 'TestStack', {
    notificationBucketName: 'unit-test-notification-bucket',
  });

  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketName: 'unit-test-notification-bucket',
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'AES256',
          },
        },
      ],
    },
    PublicAccessBlockConfiguration: {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true,
    },
  });

  template.hasResourceProperties('Custom::S3BucketNotifications', {
    BucketName: {
      Ref: Match.anyValue(),
    },
    Managed: true,
    NotificationConfiguration: {
      LambdaFunctionConfigurations: [
        {
          Events: ['s3:ObjectCreated:Put'],
          LambdaFunctionArn: {
            'Fn::GetAtt': [Match.anyValue(), 'Arn'],
          },
        },
      ],
    },
    ServiceToken: {
      'Fn::GetAtt': [Match.anyValue(), 'Arn'],
    },
    SkipDestinationValidation: false,
  });

  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'python3.9',
    Handler: 'index.lambda_handler',
    Timeout: 30,
  });

  template.hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'lambda.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    Policies: [
      Match.objectLike({
        PolicyDocument: {
          Statement: [
            {
              Action: [
                'logs:CreateLogGroup',
                'logs:CreateLogStream',
                'logs:PutLogEvents',
              ],
              Effect: 'Allow',
              Resource: 'arn:aws:logs:*:*:*',
            },
          ],
        },
      }),
    ],
  });

  template.hasResourceProperties('AWS::Lambda::Permission', {
    Action: 'lambda:InvokeFunction',
    Principal: 's3.amazonaws.com',
    SourceAccount: {
      Ref: 'AWS::AccountId',
    },
    SourceArn: {
      'Fn::GetAtt': [Match.anyValue(), 'Arn'],
    },
  });

  assert.equal(Object.keys(template.findResources('Custom::S3BucketNotifications')).length, 1);
});