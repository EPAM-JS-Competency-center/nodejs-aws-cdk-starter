import * as aws from 'aws-sdk';
import { buildResponse } from "../../utils/request-response";
//import { products } from "../mock-data/data";

const dynamodb = new aws.DynamoDB();

export const handler = async () => {
  const tableName = process.env.PRODUCT_TABLE_NAME; // Read the table name from environment variables

  if (!tableName) {
    console.error('PRODUCT_TABLE_NAME is not defined in the environment variables');
    return buildResponse(500, 'Internal Server Error');
  }

  const params = {
    TableName: tableName,
  };

  try {
    const data = await dynamodb.scan(params).promise();
    const products = data.Items;

    // Join stocks table
    const stockTableName = process.env.STOCK_TABLE_NAME; // Read the stock table name from environment variables

    if (stockTableName) {
      const stockParams = {
        TableName: stockTableName,
        ProjectionExpression: 'product_id, count', // Only retrieve product_id and count columns
      };

      const stockData = await dynamodb.scan(stockParams).promise();
      const stockItems = stockData.Items;

      // Map stock data to products
      const productsWithStock = products?.map((product) => {
        const productId = product.id; // Assuming the product id is available in the product object
        const stockItem = stockItems?.find((item) => item.product_id.S === productId);

        const stockCount = stockItem ? stockItem.count.N : 0; // Assuming count is stored as a number attribute

        return {
          ...product,
          stock: stockCount,
        };
      });

      return buildResponse(200, productsWithStock);
    }

    return buildResponse(200, products);
  } catch (error) {
      console.error('Error retrieving products from DynamoDB', error);
      return buildResponse(500, 'Error retrieving products from DynamoDB');
  }
};