import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';

import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

const app = new cdk.App;
const stack = new cdk.Stack(app, 'ProductSeerviceStack', {env: {region:'eu-west-1'}});

const sharedLambdaProps = {
    runtime: lambda.Runtime.NODEJS_18_X,
};

const getProductList = new NodejsFunction (stack, "GetProductListLambda", {
    ...sharedLambdaProps,
    functionName: 'getProductList',
    entry: 'product-service/handlers/getProducts.ts'
});

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