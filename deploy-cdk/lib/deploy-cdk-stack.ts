import * as cdk from "aws-cdk-lib";

// Stack is a group of AWS resources
export class DeployCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
  }
}
