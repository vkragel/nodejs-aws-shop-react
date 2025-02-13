#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { DeployCdkStack } from "../lib/deploy-cdk-stack";

const app = new cdk.App();
new DeployCdkStack(app, "WebsiteStack");
