module.exports = {
    plugins: [
        require('postcss-utopia')({
            minWidth: 320,          /* Defaults to plugin minWidth */
            maxWidth: 1240,         /* Defaults to plugin maxWidth */
        }),
        require('postcss-preset-env')({
            browsers: ['> 0.2% and not dead'],
            stage: true
        })
    ]
}