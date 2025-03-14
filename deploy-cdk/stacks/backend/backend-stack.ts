import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { ProductService } from "./constructs/product-service";
import { ImportService } from "./constructs/import-service";

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new ProductService(this, "ProductService");

    new ImportService(this, "ImportService");
  }
}
