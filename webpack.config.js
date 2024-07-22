import path from 'path';
import { fileURLToPath } from 'url';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { StatsWriterPlugin } from 'webpack-stats-plugin';
import fs from 'fs';
// npx webpack --config webpack.config.js

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom plugin to log chunk sizes
class ChunkSizePlugin {
  apply(compiler) {
    compiler.hooks.done.tap('ChunkSizePlugin', (stats) => {
      const chunks = stats.toJson().chunks;
      const log = chunks.map(chunk => ({
        id: chunk.id,
        name: chunk.names.join(', '),
        size: (chunk.size / 1024).toFixed(2) + ' KiB',
        files: chunk.files.join(', '),
      }));

      fs.writeFileSync(path.resolve(__dirname, 'chunk-sizes.log'), JSON.stringify(log, null, 2));
      console.log('Chunk sizes written to chunk-sizes.log');
    });
  }
}

export default {
  mode: 'production',
  entry: './src/main.jsx',
  output: {
    filename: '[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
    chunkFilename: '[name].[contenthash].js', // Ensure unique chunk filenames
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.svg$/,
        use: ['svg-url-loader'],
      },
    ],
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new StatsWriterPlugin({
      filename: 'stats.json',
      fields: null,
    }),
    new ChunkSizePlugin(),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      maxInitialRequests: Infinity,
      minSize: 20000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name(module) {
            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
            return `npm.${packageName.replace('@', '')}`;
          },
        },
      },
    },
  },
};
