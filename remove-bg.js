const { Jimp, rgbaToInt, intToRGBA } = require('jimp');

async function removeBackground() {
  try {
    const image = await Jimp.read('public/logo.png');
    const width = image.bitmap.width;
    const height = image.bitmap.height;

    // Tolerance for "white"
    const isWhite = (c) => c.r > 240 && c.g > 240 && c.b > 240;

    const visited = new Set();
    const stack = [];

    // Add corners to stack
    const corners = [
      [0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]
    ];

    for (const [x, y] of corners) {
      const color = intToRGBA(image.getPixelColor(x, y));
      if (isWhite(color)) {
        stack.push([x, y]);
        visited.add(`${x},${y}`);
      }
    }

    // Flood fill
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      
      // Make transparent
      image.setPixelColor(0x00000000, x, y);

      // Check neighbors
      const neighbors = [
        [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const key = `${nx},${ny}`;
          if (!visited.has(key)) {
            visited.add(key);
            const color = intToRGBA(image.getPixelColor(nx, ny));
            if (isWhite(color) || color.a === 0) {
              stack.push([nx, ny]);
            }
          }
        }
      }
    }

    await image.writeAsync('public/logo.png');
    console.log('Background removed successfully!');
  } catch (err) {
    console.error('Error removing background:', err);
  }
}

removeBackground();
