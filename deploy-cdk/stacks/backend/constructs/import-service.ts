import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ImportService extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = s3.Bucket.fromBucketName(
      this,
      "ImportBucket",
      "backendstack-importservice-bucket"
    );

    const createLambdaFunction = (id: string, handler: string) => {
      return new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        entry: "../server/handlers/import/index.js",
        handler: handler,
        environment: {
          BUCKET_NAME: bucket.bucketName,
        },
      });
    };

    const importProductsFileLambda = createLambdaFunction(
      "ImportProductsFileLambda",
      "importProductsFile"
    );

    bucket.grantPut(importProductsFileLambda);

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
