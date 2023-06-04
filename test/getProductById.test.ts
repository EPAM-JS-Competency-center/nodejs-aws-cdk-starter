import {handler} from "../product-service/handlers/getProductsById";
import {buildResponse} from "../utils/request-response";
import {products} from "../product-service/mock-data/data";


describe('Check that ', () => {
    it('should return a response with status code 200 and the correct product', async () => {
      const event = {
        pathParameters: {
          productId: '7', 
        },
      };
  
      const expectedProduct = products.find(item => item.id === event.pathParameters.productId);
  
      // Call the Lambda handler function
      const response = await handler(event);
  
      // Assert the response
      expect(response).toEqual(buildResponse(200, expectedProduct));
    });
  });