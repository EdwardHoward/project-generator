import app from './app';
import config from './config';

app.listen(config.port, config.hostname, () => {
    console.log(`Server listening on http://${config.hostname}:${config.port}`);
});