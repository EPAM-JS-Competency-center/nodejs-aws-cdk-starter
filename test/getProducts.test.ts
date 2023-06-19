import {handler} from "../product-service/handlers/getProducts";
import {buildResponse} from "../utils/request-response";
import {products} from "../product-service/mock-data/data";

const event = {};
describe("Lambda Handler", () => {
  it("should return a response with status code 200 and products data", async () => {
    const response = await handler(event);
    expect(response).toEqual(buildResponse(200, products));
  });
});