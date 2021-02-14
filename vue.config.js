const fs = require('fs')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: config => {
    if (process.env.NODE_ENV === 'production') {
      //
    } else {
      config.devServer = {
        host: 'localhost',
        key: fs.readFileSync('./.ssl/ca.key'),
        cert: fs.readFileSync('./.ssl/ca.crt'),
        ca: fs.readFileSync('./.ssl/ca.pem')
      }
    }
  },
}