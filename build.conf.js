module.exports = {
    module: {
        name: 'pipMaps',
        styles: 'index',
        export: 'pip.maps',
        standalone: 'pip.maps'
    },
    build: {
        js: false,
        ts: false,
	    tsd: true,
	    bundle: true,
        html: true,
        sass: true,
        lib: true,
        images: true,
        dist: false
    },
    browserify: {
        entries: [
            './src/index.ts',
            './temp/pip-suite-map-html.min.js'
        ]
    },
    file: {
        lib: [
            '../node_modules/pip-webui-all/dist/**/*'
        ]
    },
    samples: {
        port: 8101,
        https: false
    },
    api: {
        port: 8081
    }
};
