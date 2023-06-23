import * as AWSMock from "aws-sdk-mock";
import {handler} from "../import-service/handlers/importProducts";
const signedUrl = `https://aws-import-bucket.s3.eu-west-1.amazonaws.com/uploaded/${params.Key}?mockedSignature`;
AWSMock.mock('S3', 'getSignedUrlPromise', (_method, _params, callback) => {
    callback(null, signedUrl);
  });

  describe('importProductsFile', () => {
    afterEach(() => {
      AWSMock.restore(); 
    });
  
    it('should return a signed URL', async () => {
      const event = { queryStringParameters: { name: 'test-file.txt' } };
      const context = {}; // Create a mock context if needed
  
      const response = await handler(event);
  
      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual({ url: signedUrl });
    });
  
    it('should handle errors', async () => {
      // Mock the S3 method to simulate an error
      AWSMock.mock('S3', 'getSignedUrlPromise', (_method, _params, callback) => {
        callback(new Error('Mocked error'));
      });
  
      const event = { queryStringParameters: { name: 'test-file.txt' } };
      const context = {}; // Create a mock context if needed
  
      const response = await handler(event);
  
      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body)).toEqual({ message: 'Internal Server Error' });
    });
  });