import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";

interface ProductServiceProps extends cdk.StackProps {
  distribution: cloudfront.Distribution;
}

export class ProductService extends Construct {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: ProductServiceProps) {
    super(scope, id);

    // Lambda Functions Creation
    const createLambdaFunction = (id: string, handler: string) => {
      return new lambda.Function(this, id, {
        // determines which language-specific environment will be used and its version
        runtime: lambda.Runtime.NODEJS_18_X,

        // determines which function should be called
        handler: handler,

        // file location
        code: lambda.Code.fromAsset("../server", {
          exclude: ["tests/*", "node_modules/*", "*.test.js"],
        }),
      });
    };

    const getProductsListLambda = createLambdaFunction(
      "GetProductsListLambda",
      "handlers/index.getProductsList"
    );

    const getProductByIdLambda = createLambdaFunction(
      "GetProductByIdLambda",
      "handlers/index.getProductById"
    );

    // API Gateway Creation
    // Creates REST API with "ProductServiceApi" name
    this.api = new apigateway.RestApi(this, "ProductServiceApi", {
      // CORS is required for the browser to allow requests to the API from another domain.
      defaultCorsPreflightOptions: {
        allowOrigins: [props.distribution.distributionDomainName],

        // allow only GET method, others will be blocked
        allowMethods: ["GET"],
      },
      // Stage environment options
      deployOptions: {
        stageName: "dev",
      },
    });

    const productsResource = this.api.root.addResource("products");
    productsResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductsListLambda)
    );

    const productResource = productsResource.addResource("{productId}");
    productResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(getProductByIdLambda)
    );

    new cdk.CfnOutput(this, "ApiGatewayURL", {
      value: this.api.url,
      description: "Base API URL",
    });
  }
}
