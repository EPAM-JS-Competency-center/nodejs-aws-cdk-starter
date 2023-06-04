import { buildResponse } from "../../utils/request-response";
import { products } from "../mock-data/data";

export const handler = async (event) => {
    const { productId } = event.pathParameters;
    const product = products.find((item) => item.id === productId);;
    return buildResponse(200, product);
  };