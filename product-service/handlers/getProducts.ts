import * as aws from 'aws-sdk';
import { buildResponse } from "../../utils/request-response";

const dynamo = new aws.DynamoDB.DocumentClient();

const scanProducts = async () => {
  const productTableName = process.env.PRODUCT_TABLE_NAME;
  if (!productTableName  ) {
    console.error('Product tables is not defined in the environment variables');
    return buildResponse(500, 'Internal Server Error');
  }
  try {
    const scanResults = await dynamo.scan({
      TableName: productTableName,
    }).promise();
    return scanResults;
  } catch (error) {
    console.error('Error scanning products:', error);
    throw error; // Re-throw the error to be caught by the calling function or Lambda runtime
  }
};

const scanStocks = async () => {
  const stocksTableName = process.env.STOCK_TABLE_NAME;
  if (!stocksTableName  ) {
    console.error('Product tables is not defined in the environment variables');
    return buildResponse(500, 'Internal Server Error');
  }
  try {
    const scanResults = await dynamo.scan({
      TableName: stocksTableName,
    }).promise();
    return scanResults;
  } catch (error) {
    console.error('Error scanning stocks:', error);
    throw error; // Re-throw the error to be caught by the calling function or Lambda runtime
  }
};

export const handler = async (event) => {  
  console.log('Incoming request:', event);
  try {
    const scanProductResults = await scanProducts();
    const scanStocksResults = await scanStocks();

    const productsWithStock = scanProductResults.Items?.map((product) => {
      const productId = product.id; // Assuming the product id is available in the product object
      const stockItem = scanStocksResults.Items?.find((item) => item.product_id === productId);

      const stockCount = stockItem ? parseInt(stockItem.count) : 0;  // Assuming count is stored as a number attribute

      return {
        ...product,
        stock: stockCount,
      };
    });

    return buildResponse(200, productsWithStock);
  } catch (error) {
    console.error('Error executing Lambda handler:', error);
    return buildResponse(500, { error: 'Internal Server Error' });
  }
};


