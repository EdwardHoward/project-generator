function Logger(level) {
    return {
        info: (str) => {
            console.log(str);
        },
        debug: (str) => {
            if (level === "verbose") {
                console.log(str);
            }
        },
        error: (str) => {
            console.error(str);
        }
    }
}

module.exports = Logger;