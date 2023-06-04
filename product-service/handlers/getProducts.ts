import { products } from "../mock-data/data";

export const handler = async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify(products),
    };
  };