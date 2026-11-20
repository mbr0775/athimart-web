export type CropPosition = { x: number; y: number };
export type PhotoCropSettings = { zoom: number; position: CropPosition; rotation: number };

export function photoCropGeometry(width: number, height: number, zoom: number, position: CropPosition, rotation: number) {
  const quarterTurn = Math.abs(rotation % 180) === 90;
  const rotatedWidth = quarterTurn ? height : width;
  const rotatedHeight = quarterTurn ? width : height;
  const side = Math.min(rotatedWidth, rotatedHeight) / Math.max(1, Math.min(3, zoom));
  const clamp = (value: number) => Math.max(-1, Math.min(1, value));
  return {
    width: rotatedWidth,
    height: rotatedHeight,
    side,
    x: (rotatedWidth - side) * (clamp(position.x) + 1) / 2,
    y: (rotatedHeight - side) * (clamp(position.y) + 1) / 2,
  };
}

// Preview and export share this transform so the saved photo matches the editor.
export function drawPhotoCrop(context: CanvasRenderingContext2D, bitmap: ImageBitmap, size: number, zoom: number, position: CropPosition, rotation: number) {
  const crop = photoCropGeometry(bitmap.width, bitmap.height, zoom, position, rotation);
  context.clearRect(0, 0, size, size);
  context.save();
  context.scale(size / crop.side, size / crop.side);
  context.translate(-crop.x, -crop.y);
  context.translate(crop.width / 2, crop.height / 2);
  context.rotate(rotation * Math.PI / 180);
  context.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  context.restore();
}
