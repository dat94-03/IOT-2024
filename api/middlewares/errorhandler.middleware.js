const { StatusCodes } = require('http-status-codes');

const errorHandlerMiddleware = (err, req, res, next) => {
    try {
        const customErr = {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            msg: err.message || 'Something went wrong',
        };
    
        return res.status(customErr.statusCode).json({
            msg: customErr.msg
        });
    } catch (err) {
        return res.status(400).json({err: err.toString()});
    }
    
}

module.exports = errorHandlerMiddleware;