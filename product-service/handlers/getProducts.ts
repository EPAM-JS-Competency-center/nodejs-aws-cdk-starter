import { buildResponse } from "../../utils/request-response";
import { products } from "../mock-data/data";

export const handler = async () => {
    return buildResponse(200, products);
  };