const fs = require('fs')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pwa: {
    name: 'raBudget',
    themeColor: '#002419',
    msTileColor: '#000000',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    workboxPluginMode: 'InjectManifest',
    workboxOptions: {
      swSrc: 'src/sw.js',
    }
  },
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      //
    } else {
      config.devtool = 'source-map';
      config.devServer = {
        host: 'localhost',
        key: fs.readFileSync('./.ssl/ca.key'),
        cert: fs.readFileSync('./.ssl/ca.crt'),
        ca: fs.readFileSync('./.ssl/ca.pem')
      }
    }
  },
}