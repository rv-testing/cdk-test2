import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export interface S3LambdaTriggerStackProps extends cdk.StackProps {
  notificationBucketName?: string;
}

export class S3LambdaTriggerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: S3LambdaTriggerStackProps) {
    super(scope, id, props);

    const lambdaRole = new iam.Role(this, 'LambdaIAMRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      inlinePolicies: {
        root: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
              resources: ['arn:aws:logs:*:*:*'],
            }),
          ],
        }),
      },
    });

    const s3TriggerLambdaFunction = new lambda.Function(this, 'S3TriggerLambdaFunction', {
      runtime: lambda.Runtime.PYTHON_3_9,
      handler: 'index.lambda_handler',
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      code: lambda.Code.fromInline([
        'import json',
        'def lambda_handler(event, context):',
        '    print(event)',
        '    return "Hello... This is a test S3 trigger Lambda Function"',
      ].join('\n')),
    });

    const bucket = new s3.Bucket(this, 'S3BucketNotification', {
      bucketName: props?.notificationBucketName,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED_PUT,
      new s3n.LambdaDestination(s3TriggerLambdaFunction),
    );
  }
}
