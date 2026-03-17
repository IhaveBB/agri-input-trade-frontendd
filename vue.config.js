const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, //关闭语法检查
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '农资采销系统'
      return args
    })
  },
  devServer: {  
    client: {
      overlay: false
    },              //设置本地默认端口  选填
    port: 8080,
    proxy: {                 //设置代理，必须填
      '/api': {              //设置拦截器  拦截器格式   斜杠+拦截器名字，名字可以自己定
        target: 'http://localhost:8081',     //代理的目标地址
        changeOrigin: true,              //是否设置同源，输入是的
        pathRewrite: {                   //路径重写
          '^/api': '/api'                //保留/api路径，如果后端接口不需要/api前缀，改为 '^/api': ''
        }
      }
    }
 
  },
});