import { buildResponse } from "../../utils/request-response";
import { products } from "../mock-data/data";


type GetProductById = {
    pathParameters: {
      productId: string
    }
  };


export const handler = async (event: GetProductById) => {
    const { productId } = event.pathParameters;
    const product = products.find((item) => item.id === productId);;
    return buildResponse(200, product);
  };