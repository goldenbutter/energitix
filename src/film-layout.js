// Shared framing keeps the video product and the incoming 3D can aligned.
const source = { width: 1280, height: 720 };
const product = { x: 536, y: 103, width: 215, height: 507 };

export function getFilmLayout(width, height) {
  let scale, x, y;
  if (width <= 700) {
    const headingSize = Math.min(Math.max(76, Math.min(width * .24, 150)), height * .12);
    const headingBottom = height * .12 + headingSize * .98 * 2 + 25;
    const productTop = Math.max(height * .425, headingBottom + 24);
    const productHeight = Math.max(1, Math.min(height * .45, width * 1.05, height * .91 - productTop));
    scale = productHeight / product.height;
    x = width / 2 - (product.x + product.width / 2) * scale;
    y = productTop - product.y * scale;
  } else {
    scale = Math.max(width / source.width, height / source.height);
    x = (width - source.width * scale) / 2;
    y = (height - source.height * scale) / 2;
  }
  return {
    x, y, scale,
    width: source.width * scale,
    height: source.height * scale,
    productX: x + (product.x + product.width / 2) * scale,
    productY: y + (product.y + product.height / 2) * scale,
    productHeight: product.height * scale,
  };
}
