const fs = require('fs')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      //
    } else {
      config.devServer.host = 'localhost';
      config.devServer.key = fs.readFileSync('./.ssl/ca.key');
      config.devServer.cert = fs.readFileSync('./.ssl/ca.crt');
      config.devServer.ca = fs.readFileSync('./.ssl/ca.pem');
    }
  },
}