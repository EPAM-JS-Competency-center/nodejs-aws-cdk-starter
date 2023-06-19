import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

exports.handler = async (event) => { 
    const { bucket, key } = event;

  if (!bucket || !key) {
    // Handle missing parameters
    return { statusCode: 400, body: 'Missing required parameters.' };
  }
  const name = key.split('/')[1];
  const s3 = new AWS.S3();

  try {
    const getObjectParams = {
      Bucket: bucket,
      Key: key
    };

    const s3Object = await s3.getObject(getObjectParams).promise();
    const { PassThrough } = require('stream');
    const readableStream = new PassThrough();
    readableStream.end(s3Object.Body);
    // Parse the CSV data using csv-parser
    const records = [];
    readableStream.pipe(csv())
      .on('data', (record) => {
        // Log each record to CloudWatch
        console.log(record);
        records.push(record);
      })
      .on('end', async () => {
        console.log('CSV parsing completed.');
        try {
          const copyObjectParams = {
            Bucket: bucket,
            CopySource: `${bucket}/${key}`,
            Key: `parsed/${name}`
          };
          await s3.copyObject(copyObjectParams).promise();
          const deleteObjectParams = {
            Bucket: bucket,
            Key: key
          };
          await s3.deleteObject(deleteObjectParams).promise();
          console.log('File moved to "parsed" folder.');
        }catch (error) {
          console.error('Error moving file:', error);
        }
      });
    return { statusCode: 200, body: 'CSV parsing initiated.' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: 'Internal Server Error  ${error}' };  
  }
}