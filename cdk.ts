import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

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

const getProductById = new NodejsFunction(stack, 'GetProductByIdLambda', {
    ...sharedLambdaProps,
    functionName: 'getProductsById',
    entry:'product-service/handlers/getProductsById.ts'
});

const productTable = new dynamodb.Table(stack, 'ProductsTable', {
    tableName: 'products',
    partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.DESTROY, // This will delete the table when the stack is destroyed. Use with caution!
 });

const stockTable = new dynamodb.Table(stack, 'StocksTable', {
    tableName: 'stocks',
    partitionKey: { name: 'product_id', type: dynamodb.AttributeType.STRING },
    removalPolicy: cdk.RemovalPolicy.DESTROY, // This will delete the table when the stack is destroyed. Use with caution!
 });
 
getProductList.addEnvironment('PRODUCT_TABLE_NAME', productTable.tableName);
getProductList.addEnvironment('STOCK_TABLE_NAME', stockTable.tableName);
getProductById.addEnvironment('PRODUCT_TABLE_NAME', productTable.tableName);


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