const pixelit = require('./pixelit.js');
const argv = require('yargs/yargs')(process.argv.slice(2))
    .command("$0 <input> <output>")
    .option('palette', {
        alias: 'p',
        type: 'number',
    })
    .option('scale', {
        alias: 's',
        type: 'number',
    })
    .argv;
const { loadImage, createCanvas } = require("canvas");
const fs = require("fs");

async function main(){
    const img = await loadImage(argv.input);
    const canvas = createCanvas(img.width, img.height);
    const px = new pixelit({ from: img, to: canvas, palette: argv.palette, scale: argv.scale });
    px.pixelate();
    px.convertPalette();
    px.resizeImage();
    const buffer = px.drawto.toBuffer('image/png');
    fs.writeFileSync(argv.output, buffer);
}

main();
