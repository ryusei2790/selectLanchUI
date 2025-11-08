const browserSync = require("browser-sync");
require('dotenv').config();
const PROXY = process.env.PROXY;

if (PROXY) {
    // WordPressなど、プロキシが必要な場合
    browserSync({
        proxy: PROXY,
        files: [
            '**',
            'style.css',
            "src/**/**",
            "**/**.php",
        ]
    });
} else {
    // 静的HTMLの場合
    browserSync({
        server: {
            baseDir: "./"
        },
        files: [
            "*.html",
            "style.css",
            "style.min.css",
            "assets/**/*"
        ]
    });
}