// ./src/DemoWindow.js
export class DemoWindow {
  constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
  }

  get width() {
      return this.canvas.width;
  }

  set width(value) {
      this.canvas.width = value;
  }

  get height() {
      return this.canvas.height;
  }

  set height(value) {
      this.canvas.height = value;
  }

  save() {
      this.ctx.save();
  }

  restore() {
      this.ctx.restore();
  }

  setFillStyle(style) {
      this.ctx.fillStyle = style;
  }

  getFillStyle() {
      return this.ctx.fillStyle;
  }

  setFont(font) {
      this.ctx.font = font;
  }

  getFont() {
      return this.ctx.font;
  }

  setStrokeStyle(style) {
      this.ctx.strokeStyle = style;
  }

  getStrokeStyle() {
      return this.ctx.strokeStyle;
  }

  setLineWidth(width) {
      this.ctx.lineWidth = width;
  }

  getLineWidth() {
      return this.ctx.lineWidth;
  }

  fillRect(x, y, width, height) {
      this.ctx.fillRect(x, y, width, height);
  }

  strokeRect(x, y, width, height) {
      this.ctx.strokeRect(x, y, width, height);
  }

  fillText(text, x, y) {
      this.ctx.fillText(text, x, y);
  }

  drawImage(image, x, y, width, height) {
      this.ctx.drawImage(image, x, y, width, height);
  }

  beginPath() {
      this.ctx.beginPath();
  }

  closePath() {
      this.ctx.closePath();
  }

  moveTo(x, y) {
      this.ctx.moveTo(x, y);
  }

  lineTo(x, y) {
      this.ctx.lineTo(x, y);
  }

  stroke() {
      this.ctx.stroke();
  }

  rect(x, y, width, height) {
      this.ctx.rect(x, y, width, height);
  }

  clip() {
      this.ctx.clip();
  }

  translate(x, y) {
      this.ctx.translate(x, y);
  }

  clearRect(x, y, width, height) {
      this.ctx.clearRect(x, y, width, height);
  }

  clear() {
      this.clearRect(0, 0, this.width, this.height);
  }

  measureText(text) {
      return this.ctx.measureText(text);
  }
}