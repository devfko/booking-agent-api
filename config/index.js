require('dotenv').config();

const config = {
    envApp: process.env.NODE_ENV === 'production',
    appPort: process.env.URL_PORT,
    appURL: process.env.URL_DOMAIN,
    dbHost: process.env.DB_HOST,
    dbPort: process.env.DB_PORT,
    dbUser: process.env.DB_USER,
    dbPass: process.env.DB_PASS,
    dbName: process.env.DB_NAME,
    mToken: process.env.MAIN_TOKEN,
    loginToken: process.env.TOKEN_SECRET_LOGIN,
    sendgridAPI: process.env.SENGRID_API_SECRET,
    destEmail: process.env.DEST_EMAIL,
    bodyEmail: process.env.BODY_EMAIL,
    subjEmail: process.env.SUBJ_EMAIL,
    imageEstablishment: process.env.FOLDER_IMAGES_COMMERCIAL
};

const cloudinaryConfig = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    estabishmentWidth: process.env.CLOUDINARY_ESTABLISHMENT_WIDTH,
    establishmentHeigth: process.env.CLOUDINARY_ESTABLISHMENT_HEIGTH
};

module.exports = { config, cloudinaryConfig };