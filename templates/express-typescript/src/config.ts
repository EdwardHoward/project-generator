import dotenv from 'dotenv';
dotenv.config();

let port = 8080;

try {
    if(process.env.PORT) {
        port = parseInt(process.env.PORT);
    }
} catch (e) {
    console.error('Port must be a number', process.env.PORT);
}

export default {
    port,
    hostname: process.env.HOSTNAME || '0.0.0.0',
    logLevel: process.env.LOG_LEVEL || 'tiny'
}