import * as aws from 'aws-sdk';
import { buildResponse } from '../../utils/request-response';
import {createProduct} from '../handlers/createProduct';
import {SNSClient, PublishCommand} from '@aws-sdk/client-sns';

const snsClient = new SNSClient({});
export const handler = async (event) => {  
    try {
        console.log('sqs event', event);
        
        for(const record of event.Records) {
            const newProductData = await createProduct(JSON.parse(record.body));
            console.log(newProductData);
            const parsedMessage = JSON.parse(newProductData.body).message;
            await snsClient.send(
                new PublishCommand({
                    Subject: "New Files added",
                    Message: JSON.stringify(parsedMessage),
                    TopicArn: process.env.IMPORT_PRODUCT_TOPIC_ARN,
                    MessageAttributes: {
                        count: {
                            DataType: "Number",
                            StringValue: parsedMessage.count 
                        }
                    }
                })
            )
        }
        return buildResponse(200, {});
    }catch(error) {
        console.error('Error executing Lambda handler:', error);
        return buildResponse(500, { error: 'Internal Server Error' });
    }
}