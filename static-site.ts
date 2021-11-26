#!/usr/bin/env node
//@ts-nocheck
import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
import { Construct, Stack } from '@aws-cdk/core';

export class StaticSite extends Construct {
  constructor(parent: Stack, name: string) {
    super(parent, name);

    
  }
}
