import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { S3EventSource } from 'aws-cdk-lib/aws-lambda-event-sources';

const PRODUCT_TABLE_NAME = 'products';
const STOCK_TABLE_NAME = 'stocks';

const app = new cdk.App;
const stack = new cdk.Stack(app, 'ProductSeerviceStack', {env: {region:'eu-west-1'}});

const sharedLambdaProps = {
    runtime: lambda.Runtime.NODEJS_18_X,
};

const getProductList = new NodejsFunction (stack, "GetProductListLambda", {
    ...sharedLambdaProps,
    functionName: 'getProductList',
    entry: 'product-service/handlers/getProducts.ts',
    environment: {
        PRODUCT_TABLE_NAME: "products",
        STOCK_TABLE_NAME: "stocks",
      },
});

const getProductById = new NodejsFunction(stack, 'GetProductByIdLambda', {
    ...sharedLambdaProps,
    functionName: 'getProductsById',
    entry:'product-service/handlers/getProductsById.ts'
});

const createProduct = new NodejsFunction(stack, 'CreateProductLambda', {
    ...sharedLambdaProps,
    functionName: 'createProduct',
    entry: 'product-service/handlers/createProduct.ts'
});

 
getProductList.addEnvironment('PRODUCT_TABLE_NAME', PRODUCT_TABLE_NAME);
getProductList.addEnvironment('STOCK_TABLE_NAME', STOCK_TABLE_NAME);
getProductById.addEnvironment('PRODUCT_TABLE_NAME', PRODUCT_TABLE_NAME);
getProductById.addEnvironment('STOCKS_TABLE_NAME', STOCK_TABLE_NAME);
createProduct.addEnvironment('PRODUCT_TABLE_NAME', PRODUCT_TABLE_NAME);
createProduct.addEnvironment('STOCKS_TABLE_NAME', STOCK_TABLE_NAME);

const api = new HttpApi(stack,"ProductApi", {
    corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.ANY]
    }
});

api.addRoutes({
    integration: new HttpLambdaIntegration('GetProductListIntegration', getProductList),
    path:'/products',
    methods:[HttpMethod.GET]
});

api.addRoutes({
    integration: new HttpLambdaIntegration('GetProductByIdIntegration', getProductById ),
    path: '/products/{productId}',
    methods: [HttpMethod.GET]
});

api.addRoutes({
    integration: new HttpLambdaIntegration('CreateProductIntegration', createProduct ),
    path: '/products',
    methods: [HttpMethod.POST]
});


const importApp = new cdk.App;
const importStack = new cdk.Stack(importApp, 'ImportServiceStack', {env: {region:'eu-west-1'}});

const importApi = new HttpApi(importStack,"ImportProductApi", {
    corsPreflight: {
        allowHeaders: ['*'],
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.ANY]
    }
});

const importBucket = s3.Bucket.fromBucketName(importStack, 'Import-Bucket', 'aws-import-bucket');

const importProductsFile = new NodejsFunction (importStack, "importProductsFile", {
    ...sharedLambdaProps,
    functionName: 'importProductsFile',
    entry: 'import-service/handlers/importProducts.ts',
});

const importFileParser = new NodejsFunction(importStack, 'importFileParser', {
    ...sharedLambdaProps,
    functionName: 'importFileParser',
    entry: 'import-service/handlers/importFileParser.ts',
  });

importBucket.grantRead(importProductsFile);

// Add the S3 event trigger to importFileParser
importFileParser.addEventSource(
    new S3EventSource(importBucket as s3.Bucket, {
      events: [s3.EventType.OBJECT_CREATED],
      filters: [{ prefix: 'uploaded/' }],
    })
  );

importApi.addRoutes({
    integration: new HttpLambdaIntegration('ImportProductsIntegration', importProductsFile),
    path:'/import',
    methods:[HttpMethod.GET]
});

importProductsFile.addToRolePolicy(
    new PolicyStatement({
      actions: ['s3:GetObject', 's3:PutObject'],
      resources: ['arn:aws:s3:::aws-import-bucket/*'],
    })
  );

importFileParser.addToRolePolicy(
    new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: ['arn:aws:s3:::aws-import-bucket/uploaded/*'],   
    })
);

importFileParser.addToRolePolicy(
  new PolicyStatement({
      actions: ['s3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:CopyObject'
              ],
      resources: ['arn:aws:s3:::aws-import-bucket/parsed/*'],   
  })
);

importFileParser.addToRolePolicy(
    new PolicyStatement({
      actions: ['s3:GetObject',
                's3:PutObject',
                's3:DeleteObject',
                's3:CopyObject'
               ],
      resources: ['arn:aws:s3:::aws-import-bucket/uploaded/*'],
    })
  );

importFileParser.addToRolePolicy(
    new PolicyStatement({
      actions: ['logs:CreateLogStream', 'logs:CreateLogGroup', 'logs:PutLogEvents'],
      resources: ['arn:aws:logs:*:*:*'],
    })
  );
