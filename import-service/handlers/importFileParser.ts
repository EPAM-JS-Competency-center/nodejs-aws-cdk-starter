import * as AWS from 'aws-sdk';

import { CopyObjectCommand, DeleteObjectCommand, GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { S3 } from 'aws-sdk';
import { Readable } from "stream";
import cvs from "csv-parser";

export const handler = async (
    event
): Promise<any> => {
    const bucket = event.Records[0].s3.bucket.name;
    const key = event.Records[0].s3.object.key;
    const parsedKey = key.replace('uploaded', 'parsed')
    const params = {
        Bucket: bucket,
        Key: key,
    };
    const client = new S3Client({})
    const getCommand = new GetObjectCommand(params);
    const deleteCommand = new DeleteObjectCommand(params);
    const copyCommand = new CopyObjectCommand({
        CopySource: `${bucket}/${key}`,
        Bucket: bucket,
        Key: parsedKey,
    });
    const parser = cvs()
    try {
        const response = await client.send(getCommand);
        const readStream = response.Body as Readable
        await new Promise((resolve) => {
            readStream.pipe(parser)
                .on('data', (data) => console.log('parsed stream data', data))
                .on('end', async () => {
                    const copyRes = await client.send(copyCommand);
                    console.log(copyRes, 'copy to parsed')
                    const deleteRes = await client.send(deleteCommand);
                    console.log(deleteRes, 'delete from uploaded')
                    resolve(null)
                });
        })
    } catch (err) {
        console.log(err)
    }
};