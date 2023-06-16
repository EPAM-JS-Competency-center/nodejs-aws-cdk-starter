import { buildResponse } from "../../utils/request-response";
import { S3 } from 'aws-sdk';
exports.handler = async (event) => { 
    try {
        // Extract the name parameter from the query string
        const { name } = event.queryStringParameters;
    
        // Generate the S3 key for the uploaded file
        const key = `uploaded/${name}`;
    
        // Create a new instance of the S3 service
        const s3 = new S3();
        const signedUrl = await s3.getSignedUrlPromise('getObject', {
            Bucket: 'aws-import-bucket',
            Key: key,
            Expires: 3600, // URL expiration time in seconds (e.g., 1 hour)
          });
          return {
            statusCode: 200,
            body: JSON.stringify({ url: signedUrl }),
          };
        } catch (error) {
            // Handle any errors that occur
            console.error('Error:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ message: 'Internal Server Error' }),
            };
    }
    
};
