#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import FrontendStack from "../stacks/frontend";
import BackendStack from "../stacks/backend";

const app = new cdk.App();

new FrontendStack(app, "FrontendStack");

new BackendStack(app, "BackendStack");
