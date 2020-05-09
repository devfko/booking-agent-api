const boom = require('@hapi/boom');

function notFoundHandler(req, resp) {
    const {
        output: {
            statusCode,
            payload
        }
    } = boom.notFound();

    resp.status(statusCode).json(payload);
}

module.exports = notFoundHandler;