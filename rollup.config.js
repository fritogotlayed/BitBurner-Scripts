// Look into using rollup.js built in "watch" instead of nodemon

const path = require('path');
const fs = require('fs');

const outConfig = []

const dirItems = fs.readdirSync(`${__dirname}${path.sep}src`, { withFileTypes: true });
for (let i = 0; i < dirItems.length; i++) {
  const item = dirItems[i];
  if (item.name.endsWith('.js') && !item.name.endsWith('.test.js')) {
    outConfig.push({
      input: `${__dirname}${path.sep}src${path.sep}${item.name}`,
      output: [{
        file: `${__dirname}${path.sep}dist${path.sep}${item.name}`,
        format: 'es',
      }],
    });
  }
}

export default outConfig;
