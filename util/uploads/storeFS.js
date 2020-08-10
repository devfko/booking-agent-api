const { createWriteStream, unlink } = require('fs');
const { config, cloudinaryConfig } = require('../../config');
const { response } = require('express');
const cloudinary = require('cloudinary').v2;
// const UPLOAD_DIR = './public/uploads';

cloudinary.config({
    cloud_name: cloudinaryConfig.cloud_name,
    api_key: cloudinaryConfig.api_key,
    api_secret: cloudinaryConfig.api_secret
});

const storeUpload = async(upload) => {

    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const path = `${config.imageEstablishment}/${filename}`;
    const file = { filename, mimetype, path };

    // Store the file in the filesystem.
    await new Promise((resolve, reject) => {
        // Create a stream to which the upload will be written.
        const writeStream = createWriteStream(path);

        // When the upload is fully written, resolve the promise.
        writeStream.on('finish', resolve);

        // If there's an error writing the file, remove the partially written file
        // and reject the promise.
        writeStream.on('error', (error) => {
            unlink(path, () => {
                reject(error);
            });
        });

        // In Node.js <= v13, errors are not automatically propagated between piped
        // streams. If there is an error receiving the upload, destroy the write
        // stream with the corresponding error.
        stream.on('error', (error) => writeStream.destroy(error));

        // Pipe the upload into the write stream.
        stream.pipe(writeStream);
    });

    return file;
};

const cloudinaryStoreUpload = async(upload) => {

    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    let path = '';
    const file = { filename, mimetype, path };

    const cloudinaryUpload = async({ stream }) => {
        try {
            await new Promise((resolve, reject) => {
                const streamLoad = cloudinary.uploader.upload_stream({
                    width: cloudinaryConfig.estabishmentWidth,
                    height: cloudinaryConfig.establishmentHeigth
                }, function(err, result) {
                    if (result) {
                        // console.log({ result });
                        file.path = result.url;
                        resolve();
                    } else {
                        reject(err);
                    }
                });

                stream.pipe(streamLoad);
            });
        } catch (err) {
            throw new Error(`Failed to upload profile picture ! Err:${err.message}`);
        }
    };

    await cloudinaryUpload({ stream });
    console.log('file : ', file);

    return file;
};

module.exports = { storeUpload, cloudinaryStoreUpload };