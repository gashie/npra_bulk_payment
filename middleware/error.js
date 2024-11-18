const { logger } = require('../logs/winston');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    console.log(err);

    // Enhanced logging for application-specific file and line numbers
    const appStackLine = err.stack
        ? err.stack.split('\n').find(line => !line.includes('node_modules') && line.includes(process.cwd()))
        : null;
    const fileName = appStackLine ? appStackLine.match(/\((.*):\d+:\d+\)/)?.[1] : 'Unknown File';
    const lineNumber = appStackLine ? appStackLine.match(/:(\d+):\d+\)/)?.[1] : 'Unknown Line';

    // Specific database errors
    const dbErrors = {
        '23505': 'Duplicate entry found in request',
        '22P02': 'Invalid UUID in request',
        '22007': 'Invalid date/timestamp in request',
        '42P01': 'Table does not exist, please check and try again',
    };

    if (dbErrors[err.code]) {
        error = new ErrorResponse(dbErrors[err.code], 404);
        logger.error({ message: error.message, fileName, lineNumber });
    }

    // Other application-specific errors
    const appErrors = {
        'entity.parse.failed': 'Invalid JSON Fields',
        'ER_DBACCESS_DENIED_ERROR': 'Database Access Denied',
        'ER_BAD_FIELD_ERROR': 'Unknown column in request',
        'ER_TABLE_EXISTS_ERROR': 'Table already exists',
        'ER_NO_SUCH_TABLE': 'Unknown table in request',
        'EHOSTUNREACH': 'Server Failed to Connect',
        'ENOTFOUND': `Failed to connect to DB URL ${err.hostname}`,
    };

    if (appErrors[err.code] || appErrors[err.type]) {
        const message = appErrors[err.code] || appErrors[err.type];
        error = new ErrorResponse(message, 404);
        logger.error({ message, fileName, lineNumber });
        return res.status(500).json({ status: 0, message });
    }

    res.status(error.statusCode || 500).json({
        status: 0,
        message: error.message || 'Server Error',
    });
};

// Handle unhandled promise rejections
const handleRejection = (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    process.exit(1); // Restart the app in production
};

module.exports = { errorHandler, handleRejection };
