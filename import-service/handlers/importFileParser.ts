import * as AWS from 'aws-sdk';
import csv from 'csv-parser';

exports.handler = async (event) => { 
    const { bucket, key } = event;

  if (!bucket || !key) {
    // Handle missing parameters
    return { statusCode: 400, body: 'Missing required parameters.' };
  }

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
      .on('end', () => {
        console.log('CSV parsing completed.');
      });

    return { statusCode: 200, body: 'CSV parsing initiated.' };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: 'Internal Server Error  ${error}' };  
  }
}