const AWS = require("aws-sdk")
const SHARP = require("sharp")


const S3 = new AWS.S3();

const BUCKET = process.env.BUCKET;
const BUCKET_URL = process.env.BUCKET_URL;


exports.handler = (event, context, callback) => {
    // deconstruct event props
    const { rawPath } = event;

    // get required variables
    const key = rawPath.slice(1);
    const params = key.split("/");
    const size = parseInt(params[0], 10);
    const path = params.slice(1).join('/');


    // initialize fetch and upload
    S3.getObject({ Bucket: BUCKET, Key: path })
        .promise()
        .then(data => SHARP(data.Body)
            .resize({
                width: size,
                fit: SHARP.fit.contain,
            })
            .toFormat("jpg")
            .toBuffer()
        )
        .then(buffer => S3.putObject({
            Body: buffer,
            Bucket: BUCKET,
            ContentType: 'image/jpeg',
            Key: key,
        }).promise())
        .then(
            () => callback(null, {
                statusCode: 301,
                headers: { 'location': `${BUCKET_URL}/${key}` }
            })
        )
        .catch(err => callback(err));

}