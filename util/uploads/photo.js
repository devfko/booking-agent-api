const storeFS = require('./storeFS');

const modelPhoto = mongoose.model('Photo');

export const addPhoto = async(args) => {
    const { description, tags } = args;
    const { filename, mimetype, createReadStream } = await args.file;
    const stream = createReadStream();
    const pathObj = await storeFS({ stream, filename });
    const fileLocation = pathObj.path;
    const photo = await modelPhoto.create({
        fileLocation
    });
    return photo;
};