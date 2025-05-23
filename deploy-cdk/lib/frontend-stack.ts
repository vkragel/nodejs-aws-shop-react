import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";
import { RemovalPolicy } from "aws-cdk-lib";

export class FrontendStack extends cdk.Stack {
  public readonly bucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Bucket creation
    this.bucket = new s3.Bucket(this, "ReactShopBucket", {
      // by default, if we run "cdk destroy" command, our s3 bucket is saved
      // but with RemovalPolicy.DESTROY, our s3 bucket will be removed
      // additional: not recommended to use this property in production
      removalPolicy: RemovalPolicy.DESTROY,

      // S3 by default does not allow deleting a bucket if it contains files
      // but with this property, when running "cdk destroy", deleting all files inside S3 is allowed
      // additional: without this property, CDK will give the error "Bucket cannot be deleted because it is not empty."
      autoDeleteObjects: true,

      // disable public access (will be connected by cloudfront)
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    });

    // Distribution creation
    this.distribution = new cloudfront.Distribution(this, "ReactShopCDN", {
      defaultBehavior: {
        // by default, S3 Buckets closed from public access
        // CloudFront needs to receive files directly from S3, but our bucket shouldn't be public
        // OAC allows CloudFront safely read files from S3 even if our bucket is not public
        // additional: without OAC, we should make our bucket public
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.bucket),

        // determines which protocols are allowed for users accessing your site through CloudFront
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,

        // determines how CloudFront caches content
        // when user opens CloudFront URL, our files can be cached on CloudFront Servers
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
      },

      // if user opens "{url}/", index.html will be downloaded
      defaultRootObject: "index.html",

      // determines how CloudFront handles errors 403 and 404 and which pages CloudFront should redirect users
      // additional: if server returns 403/404, CloudFront returns index.html with 200 response status
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
        },
      ],
    });

    // Deployment Setup
    new s3deploy.BucketDeployment(this, "ReactAppDeployment", {
      // takes files from our build folder and archive them
      // these files will be uploaded to S3
      sources: [s3deploy.Source.asset("../client/dist")],

      // we specify in which bucket the files should be saved
      destinationBucket: this.bucket,

      // connects S3 Uploading with CloudFront
      distribution: this.distribution,

      // when we set distributionPaths, CDK creates CloudFront Invalidation for the specified paths
      // additional: ["/*"] means clearing the entire cache
      distributionPaths: ["/*"],
    });

    // CloudFront Output Setup
    // when we run "cdk deploy", our parameters will be displayed in the terminal
    new cdk.CfnOutput(this, "CloudFrontURL", {
      // distribution.distributionDomainName - automatically created URL CloudFront
      // additional: we should see "CloudFrontURL: {CloudFront URL}"
      value: this.distribution.distributionDomainName,

      // this parameter is used for AWS Console
      // the description helps you understand what exactly this Output does
      // the description is useful if you have a lot of parameters
      // additional: AWS Console -> CloudFormation -> select our stack -> open "Outputs" tab
      description: "Website URL",
    });

    new cdk.CfnOutput(this, "DistributionId", {
      // distribution.distributionDomainName - automatically created URL CloudFront
      // additional: we should see "CloudFrontURL: {CloudFront URL}"
      value: this.distribution.distributionId,

      // this parameter is used for AWS Console
      // the description helps you understand what exactly this Output does
      // the description is useful if you have a lot of parameters
      // additional: AWS Console -> CloudFormation -> select our stack -> open "Outputs" tab
      description: "Distribution Id",
    });

    new cdk.CfnOutput(this, "BucketName", {
      value: this.bucket.bucketName,
      description: "Bucket Name",
    });
  }
}
