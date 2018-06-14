const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webPackMerge = require('webpack-merge');

module.exports = function makeConfig(env) {
  let config = {
    entry: {
      main: './src/main.js',
    },
    output: {
      path: path.resolve(__dirname, './public'),
      filename: 'scripts/main.bundle.js',
      publicPath: '/',
      library: 'app',
      libraryTarget: 'this',
    },
    module: {
      rules: [{
        test: /\.css$/,
        use: [
          // 'vue-style-loader',
          {
            loader: 'file-loader',
            options: {
              name: 'assets/[name].[ext]?[hash]',
            },
          },
          'extract-loader',
          'css-loader',
        ],
      }, {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          transformAssetUrls: {
            img: 'src',
          },
        },
      },
      {
        test: /\.(png|jpg|gif|svg|woff|woff2|eot|ttf)$/i,
        loader: 'file-loader',
        options: {
          name: 'assets/[name].[ext]?[hash]',
        },
      },
      {
        test: /\.html$/,
        use: [{
          //   loader: 'extract-loader',
          // }, {
          loader: 'html-loader',
          options: {
            attrs: ['link:href', 'img:src'],
          },
        }],
      },
      {
        resourceQuery: /blockType=html/,
        use: [{
          loader: 'extract-loader',
        }, {
          loader: 'html-loader',
          options: {
            attrs: ['link:href', 'img:src'],
          },
        }],
      },
      ],
    },
    resolve: {
      modules: ['./node_modules', './'],
      alias: {
        vue$: 'vue/dist/vue.esm.js',
      },
      extensions: ['*', '.js', '.vue', '.json'],
    },
    devtool: '#eval-source-map',
    devServer: {
      historyApiFallback: true,
      contentBase: path.join(__dirname),
      hot: true,
      port: 8000,
      compress: true,
    },
    performance: {
      hints: false,
    },
    mode: env.mode,
    plugins: [new webpack.HotModuleReplacementPlugin(),
      new HtmlWebpackPlugin({
        template: path.join(__dirname, 'src/index.html'),
        filename: 'index.html',
        inject: 'body',
        chunks: ['main'],
        minify: env.mode === 'production',
      }), new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
      }),
    ],
  };

  if (env.mode === 'production') {
    config = webPackMerge.smart(config, {
      devtool: '#source-map',
      module: {
        rules: [{
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        }],
      },
    });
  }
  return config;
};
