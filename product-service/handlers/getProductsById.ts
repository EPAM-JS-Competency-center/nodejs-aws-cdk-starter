import * as aws from 'aws-sdk';
import { buildResponse } from "../../utils/request-response";


const dynamo = new aws.DynamoDB.DocumentClient();

type GetProductById = {
    pathParameters: {
      productId: string
    }
  };

  const getProductById = async (productId) => {
    try {
      const result = await dynamo.get({
        TableName: 'products',
        Key: {
          id: productId,
        },
      }).promise();
      return result.Item;
    } catch (error) {
      console.error('Error retrieving product:', error);
      throw error;
    }
  };
  
  const getStockByProductId = async (productId) => {
    try {
      const result = await dynamo.get({
        TableName: 'stocks',
        Key: {
          product_id: productId,
        },
      }).promise();
      return result.Item;
    } catch (error) {
      console.error('Error retrieving stock:', error);
      throw error;
    }
  };
  
  

export const handler = async (event: GetProductById) => {
  try {
    const productId = event.pathParameters.productId;
    const product = await getProductById(productId);
    const stock = await getStockByProductId(productId);

    if (!product) {
      return buildResponse(404, { error: 'Product not found' });
    }

    const stockCount = stock ? parseInt(stock.count) : 0;

    const productWithStock = {
      ...product,
      stock: stockCount,
    };

    return buildResponse(200, productWithStock);
  } catch (error) {
    console.error('Error executing Lambda handler:', error);
    return buildResponse(500, { error: 'Internal Server Error' });
  }
  };