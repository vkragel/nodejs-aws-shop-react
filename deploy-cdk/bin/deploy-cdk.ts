#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import FrontendStack from "../stacks/frontend";
import BackendStack from "../stacks/backend";

const app = new cdk.App();

const frontendStack = new FrontendStack(app, "FrontendStack");

new BackendStack(app, "BackendStack", {
  distribution: frontendStack.distribution,
});
