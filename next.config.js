const path = require('path');

module.exports = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['pdfjs-dist/build/pdf.worker.entry'] = path.resolve(__dirname, './pdf-worker.js');
    }
    return config;
  },
};
