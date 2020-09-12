export function notFound(req, res, next) {
    const error = new Error(`Not found - ${req.originalUrl}`);
    res.status(404);
    next(error);
}

export function errorHandler(error, req, res, next) {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        status: statusCode,
        message: error.message,
        stack: process.env.NODE_ENV === 'production' ? 'error' : error.stack,
        errors: error.errors || undefined,
    });
}