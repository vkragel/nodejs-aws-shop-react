import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { ProductService } from "./constructs/product-service";

interface BackendStackProps extends cdk.StackProps {
  distribution: cloudfront.Distribution;
}

export class BackendStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: BackendStackProps) {
    super(scope, id, props);

    new ProductService(this, "ProductService", {
      distribution: props.distribution,
    });
  }
}
