import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Table, BillingMode, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class ProductService extends Construct {
  public readonly api: apigateway.RestApi;
  public readonly productsTable: Table;
  public readonly stocksTable: Table;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.productsTable = new Table(this, "ProductsTable", {
      // set displayed table name
      tableName: "products",
      // set table primary key
      partitionKey: { name: "id", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    this.stocksTable = new Table(this, "StocksTable", {
      tableName: "stocks",
      partitionKey: { name: "product_id", type: AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      billingMode: BillingMode.PAY_PER_REQUEST,
    });

    // Lambda Functions Creation
    const createLambdaFunction = (id: string, handler: string) => {
      return new NodejsFunction(this, id, {
        // determines which language-specific environment will be used and its version
        runtime: lambda.Runtime.NODEJS_18_X,

        // file location
        entry: "../server/handlers/products/index.js",

        // determines which function should be called
        handler: handler,

        // Lambda function can work with different tables depending on the environment
        environment: {
          PRODUCTS_TABLE: this.productsTable.tableName,
          STOCKS_TABLE: this.stocksTable.tableName,
        },
      });
    };

    const getProductsListLambda = createLambdaFunction(
      "GetProductsListLambda",
      "getProductsList"
    );

    const getProductByIdLambda = createLambdaFunction(
      "GetProductByIdLambda",
      "getProductById"
    );

    const createProductLambda = createLambdaFunction(
      "CreateProductLambda",
      "createProduct"
    );

    // allow lambda function have access to read and write in DynamoDB
    // it creates IAM policy which allows Lambda function to do GetItem, PutItem, Scan, DeleteItem etc
    // without this method, the lambda will not have permission to access the DynamoDB table.
    this.productsTable.grantReadData(getProductsListLambda);
    this.productsTable.grantReadData(getProductByIdLambda);
    this.productsTable.grantWriteData(createProductLambda);
    this.stocksTable.grantReadData(getProductsListLambda);
    this.stocksTable.grantReadData(getProductByIdLambda);
    this.stocksTable.grantWriteData(createProductLambda);

    // API Gateway Creation
    // Creates REST API with "ProductServiceApi" name
    this.api = new apigateway.RestApi(this, "ProductServiceApi", {
      // CORS is required for the browser to allow requests to the API from another domain.
      defaultCorsPreflightOptions: {
        allowOrigins: ["*"],

        // allow only GET method, others will be blocked
        allowMethods: ["GET", "POST", "PUT", "DELETE"],
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
    productsResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createProductLambda)
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
