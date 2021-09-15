async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

function replace(str, format) {
    format.forEach(f => {
        str = str.replace(f.replace, f.value);
    });

    return str;
}


module.exports = {
    asyncForEach,
    replace
}