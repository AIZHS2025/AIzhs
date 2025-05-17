const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const fs = require('fs');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@cloud': path.resolve(__dirname, 'cloudfunctions')
      }
    },
    plugins: [
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, 'src/cloudfunctions'),
            to: path.join(__dirname, 'dist/build/mp-weixin/cloudfunctions'),
            globOptions: {
              ignore: ['**/node_modules/**']
            }
          }
        ]
      }),
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('UpdateProjectConfig', () => {
            const configPath = path.join(__dirname, 'dist/build/mp-weixin/project.config.json');
            if (fs.existsSync(configPath)) {
              try {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                config.cloudfunctionRoot = 'cloudfunctions/';
                config.cloud = true;
                fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
                console.log('已更新 project.config.json 添加云函数配置');
              } catch (err) {
                console.error('更新 project.config.json 失败:', err);
              }
            }
          });
        }
      }
    ]
  }
} 