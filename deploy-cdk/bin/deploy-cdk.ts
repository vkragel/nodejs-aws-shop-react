#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { FrontendStack } from "../lib/frontend-stack";
import { ProductServiceStack } from "../lib/product-service-stack";
import { ImportServiceStack } from "../lib/import-service-stack";
import { AuthorizationServiceStack } from "../lib/authorization-service-stack";

const app = new cdk.App();

new ProductServiceStack(app, "ProductServiceStack");

new AuthorizationServiceStack(app, "AuthorizationServiceStack");

new ImportServiceStack(app, "ImportServiceStack");

new FrontendStack(app, "FrontendStack");
