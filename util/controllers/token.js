const mongoose = require('mongoose');
const modelCommEstablishment = mongoose.model('Commercial_Establishment');
const modelToken = mongoose.model('Token');

module.exports = {
    confirmationToken: function(req, resp, next) {
        modelToken.findOne({ token: req.params.token }, function(err, token) {
            if (!token) {
                return resp.status(400).send({
                    code: 400,
                    message: 'No encontramos un usuario con este token o se encuentra Expirado'
                });
            }
            modelCommEstablishment.findById(token.commercialID, function(err, commercialInfo) {
                if (!commercialInfo) {
                    return resp.status(400).send({
                        code: 400,
                        message: 'No encontramos un usuario con este token'
                    });
                }
                if (commercialInfo.active) {
                    return resp.status(208).send({
                        code: 208,
                        message: 'La Cuenta ya ha sido activada'
                    });
                }
                commercialInfo.active = true;
                modelCommEstablishment.findOneAndUpdate({
                        "_id": mongoose.Types.ObjectId(commercialInfo._id)
                    }, { "$set": commercialInfo }, { new: true })
                    .exec()
                    .then((result) => {
                        return resp.status(202).send({
                            code: 202,
                            message: 'Cuenta activada correctamente'
                        });
                    })
                    .catch((err) => {
                        return resp.status(500).send({
                            code: 500,
                            mesage: err.message
                        });
                    });
            });
        });
    }
};