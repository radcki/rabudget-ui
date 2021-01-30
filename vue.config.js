const fs = require('fs')

module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  configureWebpack: {
    devtool: 'source-map'
    // module: {
    //   rules: [
    //     // SASS has different line endings than SCSS
    //     // and cannot use semicolons in the markup
    //     {
    //       test: /\.sass$/,
    //       use: [
    //         'vue-style-loader',
    //         'css-loader',
    //         {
    //           loader: 'sass-loader',
    //           // Requires sass-loader@^7.0.0
    //           options: {
    //             // This is the path to your variables
    //             data: "@import '@/styles/variables.scss'"
    //           },
    //           // Requires sass-loader@^8.0.0
    //           options: {
    //             // This is the path to your variables
    //             prependData: "@import '@/styles/variables.scss'"
    //           },
    //           // Requires sass-loader@^9.0.0
    //           options: {
    //             // This is the path to your variables
    //             additionalData: "@import '@/styles/variables.scss'"
    //           },
    //         },
    //       ],
    //     },
    //     // SCSS has different line endings than SASS
    //     // and needs a semicolon after the import.
    //     {
    //       test: /\.s(c|a)ss$/,
    //       use: [
    //         'vue-style-loader',
    //         'css-loader',
    //         {
    //           loader: 'sass-loader',
    //           options: {
    //             // This is the path to your variables
    //             additionalData: "@import '@/styles/variables.scss';",

    //             implementation: require('sass'),
    //             sassOptions: {
    //               indentedSyntax: true // optional
    //             },
    //           },
    //         },
    //       ],
    //     },
    //   ],
    // }
  },
  devServer: {
    host: 'localhost',
    key: fs.readFileSync('./cert/ca.key'),
    cert: fs.readFileSync('./cert/ca.crt'),
    ca: fs.readFileSync('./cert/ca.pem'),
  }
}