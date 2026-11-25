const sharp = require('../node_modules/sharp');
const fs = require('fs');
const path = require('path');

const svgPath = path.join(__dirname, '../public/icons/icon.svg');
const svg = fs.readFileSync(svgPath);

async function main() {
  await sharp(svg).resize(512).png().toFile(path.join(__dirname, '../public/icons/icon-512.png'));
  console.log('Generated icon-512.png');

  await sharp(svg).resize(192).png().toFile(path.join(__dirname, '../public/icons/icon-192.png'));
  console.log('Generated icon-192.png');

  await sharp(svg).resize(180).png().toFile(path.join(__dirname, '../public/apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

main().catch(err => { console.error(err); process.exit(1); });
