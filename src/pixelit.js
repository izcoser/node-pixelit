/**
 * pixelit - convert an image to Pixel Art, with/out grayscale and based on a color palette.
 * @author José Moreira @ <https://github.com/giventofly/pixelit>
 **/

const { createCanvas } = require("canvas");

class pixelit {
    constructor(config = {}) {
        //target for canvas
        this.drawto = config.to
        //origin of uploaded image/src img
        this.drawfrom = config.from
        //hide image element
        //this.hideFromImg();
        //range between 0 to 100
        this.scale =
            config.scale && config.scale > 0 && config.scale <= 50
                ? config.scale * 0.01
                : 50 * 0.01;

        this.palettes = [
            [
                [7, 5, 5],
                [33, 25, 25],
                [82, 58, 42],
                [138, 107, 62],
                [193, 156, 77],
                [234, 219, 116],
                [160, 179, 53],
                [83, 124, 68],
                [66, 60, 86],
                [89, 111, 175],
                [107, 185, 182],
                [251, 250, 249],
                [184, 170, 176],
                [121, 112, 126],
                [148, 91, 40],
            ],
            [
                [13, 43, 69],
                [32, 60, 86],
                [84, 78, 104],
                [141, 105, 122],
                [208, 129, 89],
                [255, 170, 94],
                [255, 212, 163],
                [255, 236, 214],
            ],
            [
                [43, 15, 84],
                [171, 31, 101],
                [255, 79, 105],
                [255, 247, 248],
                [255, 129, 66],
                [255, 218, 69],
                [51, 104, 220],
                [73, 231, 236],
            ],
            [
                [48, 0, 48],
                [96, 40, 120],
                [248, 144, 32],
                [248, 240, 136],
            ],
            [
                [239, 26, 26],
                [172, 23, 23],
                [243, 216, 216],
                [177, 139, 139],
                [53, 52, 65],
                [27, 26, 29],
            ],
            [
                [26, 28, 44],
                [93, 39, 93],
                [177, 62, 83],
                [239, 125, 87],
                [255, 205, 117],
                [167, 240, 112],
                [56, 183, 100],
                [37, 113, 121],
                [41, 54, 111],
                [59, 93, 201],
                [65, 166, 246],
                [115, 239, 247],
                [244, 244, 244],
                [148, 176, 194],
                [86, 108, 134],
                [51, 60, 87],
            ],
            [
                [44, 33, 55],
                [118, 68, 98],
                [237, 180, 161],
                [169, 104, 104],
            ],

            [
                [171, 97, 135],
                [235, 198, 134],
                [216, 232, 230],
                [101, 219, 115],
                [112, 157, 207],
                [90, 104, 125],
                [33, 30, 51],
            ],
            [
                [140, 143, 174],
                [88, 69, 99],
                [62, 33, 55],
                [154, 99, 72],
                [215, 155, 125],
                [245, 237, 186],
                [192, 199, 65],
                [100, 125, 52],
                [228, 148, 58],
                [157, 48, 59],
                [210, 100, 113],
                [112, 55, 127],
                [126, 196, 193],
                [52, 133, 157],
                [23, 67, 75],
                [31, 14, 28],
            ],
            [
                [94, 96, 110],
                [34, 52, 209],
                [12, 126, 69],
                [68, 170, 204],
                [138, 54, 34],
                [235, 138, 96],
                [0, 0, 0],
                [92, 46, 120],
                [226, 61, 105],
                [170, 92, 61],
                [255, 217, 63],
                [181, 181, 181],
                [255, 255, 255],
            ],
            [
                [49, 31, 95],
                [22, 135, 167],
                [31, 213, 188],
                [237, 255, 177],
            ],
            [
                [21, 25, 26],
                [138, 76, 88],
                [217, 98, 117],
                [230, 184, 193],
                [69, 107, 115],
                [75, 151, 166],
                [165, 189, 194],
                [255, 245, 247],
            ],
        ];
        this.palette = this.palettes[config.palette || 0];
        this.maxHeight = config.maxHeight;
        this.maxWidth = config.maxWidth;
        this.ctx = this.drawto.getContext("2d");
        //save latest converted colors
        this.endColorStats = {};
    }

    /**
     *
     * @param {int} scale set pixelate scale [0...50]
     */
    setScale(scale) {
        this.scale = scale > 0 && scale <= 50 ? scale * 0.01 : 8 * 0.01;
        return this;
    }

    /**
     * 
      @return {arr} of current palette
     */
    getPalette() {
        return this.palette;
    }

    /**
     * color similarity between colors, lower is better
     * @param {array} rgbColor array of ints to make a rgb color: [int,int,int]
     * @param {array} compareColor array of ints to make a rgb color: [int,int,int]
     * @returns {number} limits [0-441.6729559300637]
     */

    colorSim(rgbColor, compareColor) {
        let i;
        let max;
        let d = 0;
        for (i = 0, max = rgbColor.length; i < max; i++) {
            d += (rgbColor[i] - compareColor[i]) * (rgbColor[i] - compareColor[i]);
        }
        return Math.sqrt(d);
    }

    /**
     * given actualColor, check from the paletteColors the most aproximated color
     * @param {array} actualColor rgb color to compare [int,int,int]
     * @returns {array} aproximated rgb color
     */
    similarColor(actualColor) {
        let selectedColor = [];
        let currentSim = this.colorSim(actualColor, this.palette[0]);
        let nextColor;
        this.palette.forEach((color) => {
            nextColor = this.colorSim(actualColor, color);
            if (nextColor <= currentSim) {
                selectedColor = color;
                currentSim = nextColor;
            }
        });
        return selectedColor;
    }

    /**
     * pixelate based on @author rogeriopvl <https://github.com/rogeriopvl/8bit>
     * Draws a pixelated version of an image in a given canvas
     */
    pixelate() {
        this.drawto.width = this.drawfrom.naturalWidth;
        this.drawto.height = this.drawfrom.naturalHeight;
        let scaledW = this.drawto.width * this.scale;
        let scaledH = this.drawto.height * this.scale;

        //make temporary canvas to make new scaled copy
        const tempCanvas = createCanvas(this.drawto.width, this.drawto.height);

        //corner case of bigger images, increase the temporary canvas size to fit everything
        if (this.drawto.width > 900 || this.drawto.height > 900) {
            //fix sclae to pixelate bigger images
            this.scale *= 0.5;
            scaledW = this.drawto.width * this.scale;
            scaledH = this.drawto.height * this.scale;
            //make it big enough to fit
            tempCanvas.width = Math.max(scaledW, scaledH) + 50;
            tempCanvas.height = Math.max(scaledW, scaledH) + 50;
        }
        // get the context
        const tempContext = tempCanvas.getContext("2d");
        // draw the image into the canvas
        tempContext.drawImage(this.drawfrom, 0, 0, scaledW, scaledH);
        //document.body.appendChild(tempCanvas);
        //configs to pixelate
        this.ctx.mozImageSmoothingEnabled = false;
        this.ctx.webkitImageSmoothingEnabled = false;
        this.ctx.imageSmoothingEnabled = false;

        //calculations to remove extra border
        let finalWidth = this.drawfrom.naturalWidth;
        if (this.drawfrom.naturalWidth > 300) {
            finalWidth +=
                this.drawfrom.naturalWidth > this.drawfrom.naturalHeight
                    ? parseInt(
                        this.drawfrom.naturalWidth / (this.drawfrom.naturalWidth * this.scale)
                    ) / 1.5
                    : parseInt(
                        this.drawfrom.naturalWidth / (this.drawfrom.naturalWidth * this.scale)
                    );
        }
        let finalHeight = this.drawfrom.naturalHeight;
        if (this.drawfrom.naturalHeight > 300) {
            finalHeight +=
                this.drawfrom.naturalHeight > this.drawfrom.naturalWidth
                    ? parseInt(
                        this.drawfrom.naturalHeight / (this.drawfrom.naturalHeight * this.scale)
                    ) / 1.5
                    : parseInt(
                        this.drawfrom.naturalHeight / (this.drawfrom.naturalHeight * this.scale)
                    );
        }
        //draw to final canvas
        //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage
        this.ctx.drawImage(
            tempCanvas,
            0,
            0,
            scaledW,
            scaledH,
            0,
            0,
            finalWidth, //+ Math.max(24, 25 * this.scale),
            finalHeight //+ Math.max(24, 25 * this.scale)
        );
        return this;
    }

    /**
     * Converts image to grayscale
     */
    convertGrayscale() {
        const w = this.drawto.width;
        const h = this.drawto.height;
        var imgPixels = this.ctx.getImageData(0, 0, w, h);
        for (var y = 0; y < imgPixels.height; y++) {
            for (var x = 0; x < imgPixels.width; x++) {
                var i = y * 4 * imgPixels.width + x * 4;
                var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                imgPixels.data[i] = avg;
                imgPixels.data[i + 1] = avg;
                imgPixels.data[i + 2] = avg;
            }
        }
        this.ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        return this;
    }

    /**
     * converts image to palette using the defined palette or default palette
     */
    convertPalette() {
        const w = this.drawto.width;
        const h = this.drawto.height;
        var imgPixels = this.ctx.getImageData(0, 0, w, h);
        for (var y = 0; y < imgPixels.height; y++) {
            for (var x = 0; x < imgPixels.width; x++) {
                var i = y * 4 * imgPixels.width + x * 4;
                //var avg = (imgPixels.data[i] + imgPixels.data[i + 1] + imgPixels.data[i + 2]) / 3;
                const finalcolor = this.similarColor([
                    imgPixels.data[i],
                    imgPixels.data[i + 1],
                    imgPixels.data[i + 2],
                ]);
                imgPixels.data[i] = finalcolor[0];
                imgPixels.data[i + 1] = finalcolor[1];
                imgPixels.data[i + 2] = finalcolor[2];
            }
        }
        this.ctx.putImageData(imgPixels, 0, 0, 0, 0, imgPixels.width, imgPixels.height);
        return this;
    }

    /**
     * Resizes image proportionally according to a max width or max height
     * height takes precedence if definied
     */
    resizeImage() {
        //var ctx = canvas.getContext("2d")
        let ratio = 1.0;

        //if none defined skip
        if (!this.maxWidth && !this.maxHeight) {
            return 0;
        }

        if (this.maxWidth && this.drawto.width > this.maxWidth) {
            ratio = this.maxWidth / this.drawto.width;
        }
        //max height overrides max width
        if (this.maxHeight && this.drawto.height > this.maxHeight) {
            ratio = this.maxHeight / this.drawto.height;
        }

        const canvasCopy = createCanvas(this.drawto.width, this.drawto.height);
        const copyContext = canvasCopy.getContext("2d");
        copyContext.drawImage(this.drawto, 0, 0);

        this.drawto.width = this.drawto.width * ratio;
        this.drawto.height = this.drawto.height * ratio;
        this.ctx.drawImage(
            canvasCopy,
            0,
            0,
            canvasCopy.width,
            canvasCopy.height,
            0,
            0,
            this.drawto.width,
            this.drawto.height
        );

        return this;
    }

    /**
     * draw to canvas from image source and resize
     *
     */
    draw() {
        //draw image to canvas
        this.drawto.width = this.drawfrom.width;
        this.drawto.height = this.drawfrom.height;
        //draw
        this.ctx.drawImage(this.drawfrom, 0, 0);
        //resize is always done
        this.resizeImage();
        return this;
    }
}

module.exports = pixelit;