const path = require('path')
module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'index.js',
    // 访问打包输出目录资源的路径（虚拟地址）   /static -> ./dist
    publicPath: '/static'
  },
  devServer: {
    port: 8080,
    // 服务根目录（物理地址），默认项目根目录
    contentBase: path.join(__dirname, './public')
  }
}
