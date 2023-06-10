import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

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


 
getProductList.addEnvironment('PRODUCT_TABLE_NAME', PRODUCT_TABLE_NAME);
getProductList.addEnvironment('STOCK_TABLE_NAME', STOCK_TABLE_NAME);
getProductById.addEnvironment('PRODUCT_TABLE_NAME', PRODUCT_TABLE_NAME);
getProductById.addEnvironment('STOCKS_TABLE_NAME', STOCK_TABLE_NAME);


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