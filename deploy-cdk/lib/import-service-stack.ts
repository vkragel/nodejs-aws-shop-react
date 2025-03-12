import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { RemovalPolicy } from "aws-cdk-lib";
import * as s3event from "aws-cdk-lib/aws-s3-notifications";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const queueArn = cdk.Fn.importValue("CatalogItemsQueueArn");

    const bucket = new s3.Bucket(this, "Bucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      cors: [
        {
          allowedOrigins: ["*"],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedHeaders: ["*"],
        },
      ],
    });

    const catalogItemsQueue = sqs.Queue.fromQueueAttributes(
      this,
      "ImportedQueue",
      {
        queueArn: queueArn,
      }
    );

    const createLambdaFunction = (id: string, handler: string) => {
      return new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        entry: "../server/handlers/import/index.js",
        handler: handler,
        environment: {
          BUCKET_NAME: bucket.bucketName,
          CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
        },
      });
    };

    const importProductsFileLambda = createLambdaFunction(
      "ImportProductsFileLambda",
      "importProductsFile"
    );

    const importFileParserLambda = createLambdaFunction(
      "ImportFileParserLambda",
      "parseProductsFile"
    );

    bucket.grantPut(importProductsFileLambda);
    bucket.grantRead(importFileParserLambda);
    bucket.grantPut(importFileParserLambda);
    bucket.grantDelete(importFileParserLambda);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3event.LambdaDestination(importFileParserLambda),
      { prefix: "uploaded/" }
    );

    catalogItemsQueue.grantSendMessages(importFileParserLambda);

    const api = new apigateway.RestApi(this, "ImportServiceApi", {
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],
        allowMethods: ["GET"],
        allowHeaders: ["*"],
      },
      deployOptions: {
        stageName: "dev",
      },
    });

    const importResource = api.root.addResource("import");
    importResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(importProductsFileLambda),
      {
        requestParameters: {
          "method.request.querystring.name": true,
        },
      }
    );
  }
}
