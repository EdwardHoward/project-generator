function replace(str, format) {
    format.forEach(f => {
        str = str.replace(f.replace, f.value);
    });

    return str;
}

module.exports = {
    replace
}