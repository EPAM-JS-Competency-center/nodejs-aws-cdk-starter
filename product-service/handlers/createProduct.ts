import * as aws from 'aws-sdk';
import { buildResponse } from "../../utils/request-response";

const dynamo = new aws.DynamoDB.DocumentClient();

const validateProduct = (product) => {
  if (!product.id || typeof product.id !== 'string') {
    throw new Error('Invalid product ID');
  }

  if (!product.name || typeof product.name !== 'string') {
    throw new Error('Invalid product name');
  }

  if (!product.price || typeof product.price !== 'number') {
    throw new Error('Invalid product price');
  }

  return true;
};

export const createProduct = async (product) => {
  try {
    await dynamo.transactWrite({
      TransactItems: [
        {
          Put: {
            TableName: 'products',
            Item: {
              id: product.id,
              title: product.title,
              description: product.description,
              price: product.price
            },
            ConditionExpression: 'attribute_not_exists(id)'
          }
        },
        {
          Put: {
            TableName: 'stocks',
            Item: {
              product_id: product.id,
              count: product.stock,
            },
            ConditionExpression: 'attribute_not_exists(product_id)'
          }
        }
      ]
    }).promise();

    return product;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  console.log('Incoming request:', event);
  console.log('Incoming request body:', event.body);

  try {
    const product = JSON.parse(event.body);
    validateProduct(product);
    await createProduct(product);
    return buildResponse(200, { message: 'Product created successfully' });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Invalid')) {
      return buildResponse(400, { error: error.message });
    }

    if (error.code === 'TransactionCanceledException') {
      return buildResponse(400, { error: 'Transaction failed' });
    }

    console.error('Error executing Lambda product creation handler:', error);
    return buildResponse(500, { error: 'Internal Server Error' });
  }
};