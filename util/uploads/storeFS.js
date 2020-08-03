const { createWriteStream, unlink } = require('fs');
const UPLOAD_DIR = './public/uploads';

// const storeFS = ({ stream, filename }) => {
//     const uploadDir = './photos';
//     const path = `${uploadDir}/${filename}`;
//     return new Promise((resolve, reject) =>
//         stream
//         .on('error', error => {
//             if (stream.truncated)
//             // delete the truncated file
//                 fs.unlinkSync(path);
//             reject(error);
//         })
//         .pipe(fs.createWriteStream(path))
//         .on('error', error => reject(error))
//         .on('finish', () => resolve({ path }))
//     );
// };

const storeUpload = async(upload) => {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();
    const path = `${UPLOAD_DIR}/${filename}`;
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

    // Record the file metadata in the DB.
    // db.get('uploads').push(file).write();

    return file;
};

module.exports = storeUpload;