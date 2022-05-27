#!/bin/bash
set -e


env="dev"
envPro="dev01"
awsAccount="003888721705"


if [ "$1" = "sit" ]; then
    env="sit"   
    awsAccount="754720606388"
    s3_bucket="hpo-services-cloudformation-${env}-${awsAccount}"
    profile="${env}-hpo-services"
    stack_name="producer-crm-sink-${env}"
elif [ "$1" = "prod" ]; then
    echo "no prod releases from local! are you crazy!?"
    exit 0
else
    env="dev"   
    awsAccount="003888721705"
    s3_bucket="hpo-services-cloudformation-${env}-${awsAccount}"
    profile="${env}-hpo-services"
    stack_name="producer-crm-sink-${env}"
fi


#lumeris-aws login -p $profile

#aws-azure-login --profile $profile
aws sso login --profile $profile

# Build the artifacts and zip them up
if [ "$1" != "skip-build" ] && [ "$2" != "skip-build" ]; then
  
  cd ..

    rm -rf artifacts
    rm -rf dist
    rm -rf cfn/producer-crm-sink.zip

    mkdir artifacts
    mkdir dist

    npm ci
    npm run lint
    npm run build
    npm prune --production

    zip -r artifacts/producer-crm-sink.zip dist/ node_modules
    cd cfn/
    cp ../artifacts/*.zip ./

else
    echo "Skipping build..."
fi



aws cloudformation package \
    --template-file producer-crm-sink-cfn.yaml \
    --s3-bucket $s3_bucket \
    --output-template-file producer-crm-sink.yaml \
    --profile $profile

# Build up the parameters and tags
params=$(lumeris-aws parse-parameters -e=$env)
tags=$(lumeris-aws parse-tags)

# Update the Cloudformation Stack.
aws cloudformation deploy \
    --region us-east-1 \
    --no-fail-on-empty-changeset \
    --template-file producer-crm-sink.yaml \
    --stack-name $stack_name \
    --capabilities CAPABILITY_NAMED_IAM \
    --parameter-overrides $params \
    --tags $tags \
    --profile $profile