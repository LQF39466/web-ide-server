const fs = require('fs')
const path = require('path')

function addMapping(router, mapping) {
    for (let url in mapping) {
        if (url.startsWith('GET ')) {
            const path = url.substring(4);
            router.get(path, mapping[url]);
        } else if (url.startsWith('POST ')) {
            const path = url.substring(5);
            router.post(path, mapping[url]);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

function addControllers(router, dir) {
    const files = fs.readdirSync(path.resolve(__dirname, dir));
    const js_files = files.filter((f) => {
        return f.endsWith('.js');
    });

    for (let f of js_files) {
        let mapping = require(path.resolve(__dirname, 'controllers', f));
        addMapping(router, mapping);
    }
}

module.exports = (router) => {
    addControllers(router, 'controllers');
    return router.routes();
};