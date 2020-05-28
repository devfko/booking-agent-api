const express = require('express');
const router = express.Router();
// const tokenController = require('../controllers/token');

// router.get('/confirmation/:token', tokenController.confirmationGet);
router.get('/confirmation/:token', function(req, resp) {
    resp.status(200).send({
        "data": {
            message: 'Route working',
            code: 200
        }
    });
});

module.exports = router;