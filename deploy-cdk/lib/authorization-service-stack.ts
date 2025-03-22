import "dotenv/config";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";

export class AuthorizationServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const GITHUB_LOGIN = process.env.GITHUB_LOGIN || "";
    const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD || "";

    const createLambdaFunction = (id: string, handler: string) => {
      return new NodejsFunction(this, id, {
        runtime: Runtime.NODEJS_18_X,
        entry: "../server/handlers/authorization/index.js",
        handler: handler,
        environment: {
          [GITHUB_LOGIN]: GITHUB_PASSWORD,
        },
      });
    };

    const basicAuthorizerLambda = createLambdaFunction(
      "BasicAuthorizerLambda",
      "basicAuthorizer"
    );

    basicAuthorizerLambda.grantInvoke(
      new iam.ServicePrincipal("apigateway.amazonaws.com")
    );

    new cdk.CfnOutput(this, "BasicAuthorizerArn", {
      value: basicAuthorizerLambda.functionArn,
      exportName: "BasicAuthorizerArn",
    });
  }
}
