import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { Table, BillingMode, AttributeType } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as lambdaEventSources from "aws-cdk-lib/aws-lambda-event-sources";

export class ProductServiceStack extends cdk.Stack {
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

    const catalogItemsQueue = new sqs.Queue(this, "CatalogItemsQueue", {
      queueName: "catalogItemsQueue",
      visibilityTimeout: cdk.Duration.seconds(60),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      receiveMessageWaitTime: cdk.Duration.seconds(20),
    });

    // Lambda Functions Creation
    const createLambdaFunction = (
      id: string,
      handler: string,
      options?: { [key: string]: any }
    ) => {
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
          CATALOG_ITEMS_QUEUE_URL: catalogItemsQueue.queueUrl,
        },
        ...options,
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

    const catalogBatchProcessLambda = createLambdaFunction(
      "CatalogBatchProcessLambda",
      "processCatalogBatch",
      { timeout: cdk.Duration.seconds(30) }
    );

    catalogBatchProcessLambda.addEventSource(
      new lambdaEventSources.SqsEventSource(catalogItemsQueue, {
        batchSize: 5,
        // Lambda will wait up to 20 seconds to collect messages before processing
        maxBatchingWindow: cdk.Duration.seconds(20),
        reportBatchItemFailures: true,
      })
    );

    // allow lambda function have access to read and write in DynamoDB
    // it creates IAM policy which allows Lambda function to do GetItem, PutItem, Scan, DeleteItem etc
    // without this method, the lambda will not have permission to access the DynamoDB table.
    this.productsTable.grantReadData(getProductsListLambda);
    this.productsTable.grantReadData(getProductByIdLambda);
    this.productsTable.grantWriteData(createProductLambda);
    this.productsTable.grantWriteData(catalogBatchProcessLambda);
    this.stocksTable.grantReadData(getProductsListLambda);
    this.stocksTable.grantReadData(getProductByIdLambda);
    this.stocksTable.grantWriteData(createProductLambda);
    this.stocksTable.grantWriteData(catalogBatchProcessLambda);

    catalogItemsQueue.grantConsumeMessages(catalogBatchProcessLambda);

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

    new cdk.CfnOutput(this, "BaseProductApiUrl", {
      value: this.api.url,
      description: "Base Product API URL",
    });

    new cdk.CfnOutput(this, "CatalogItemsQueueArn", {
      value: catalogItemsQueue.queueArn,
      exportName: "CatalogItemsQueueArn",
    });
  }
}
