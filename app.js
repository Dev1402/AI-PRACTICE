const imageInput = document.getElementById('imageInput');
const convertButton = document.getElementById('convertButton');
const resetButton = document.getElementById('resetButton');
const inputCanvas = document.getElementById('inputCanvas');
const pointCloudCanvas = document.getElementById('pointCloudCanvas');
const inputCtx = inputCanvas.getContext('2d');
const pointCtx = pointCloudCanvas.getContext('2d');

let loadedImage = null;

function drawPlaceholder() {
  inputCtx.fillStyle = '#020617';
  inputCtx.fillRect(0, 0, inputCanvas.width, inputCanvas.height);
  pointCtx.fillStyle = '#020617';
  pointCtx.fillRect(0, 0, pointCloudCanvas.width, pointCloudCanvas.height);

  inputCtx.fillStyle = '#9fb0c8';
  inputCtx.font = '16px sans-serif';
  inputCtx.fillText('Upload an image to begin', 130, 240);

  pointCtx.fillStyle = '#9fb0c8';
  pointCtx.font = '16px sans-serif';
  pointCtx.fillText('3D preview appears here', 138, 240);
}

function drawImagePreview(img) {
  inputCtx.clearRect(0, 0, inputCanvas.width, inputCanvas.height);
  const scale = Math.min(inputCanvas.width / img.width, inputCanvas.height / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  const x = (inputCanvas.width - w) / 2;
  const y = (inputCanvas.height - h) / 2;
  inputCtx.drawImage(img, x, y, w, h);
}

function renderPointCloud() {
  if (!loadedImage) return;

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = 120;
  sampleCanvas.height = 120;
  const sampleCtx = sampleCanvas.getContext('2d');
  sampleCtx.drawImage(loadedImage, 0, 0, sampleCanvas.width, sampleCanvas.height);

  const imageData = sampleCtx.getImageData(0, 0, sampleCanvas.width, sampleCanvas.height).data;
  const points = [];

  for (let y = 0; y < sampleCanvas.height; y += 2) {
    for (let x = 0; x < sampleCanvas.width; x += 2) {
      const i = (y * sampleCanvas.width + x) * 4;
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      const a = imageData[i + 3];
      if (a < 100) continue;

      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      points.push({
        x: x - sampleCanvas.width / 2,
        y: y - sampleCanvas.height / 2,
        z: luminance * 80,
        color: `rgb(${r}, ${g}, ${b})`
      });
    }
  }

  pointCtx.fillStyle = '#020617';
  pointCtx.fillRect(0, 0, pointCloudCanvas.width, pointCloudCanvas.height);

  const angleY = Math.PI / 5;
  const angleX = -Math.PI / 8;
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);

  points.sort((a, b) => a.z - b.z);

  for (const point of points) {
    const xRot = point.x * cosY - point.z * sinY;
    const zRot = point.x * sinY + point.z * cosY;
    const yRot = point.y * cosX - zRot * sinX;
    const zFinal = point.y * sinX + zRot * cosX;

    const perspective = 2.8 + zFinal * 0.02;
    const sx = pointCloudCanvas.width / 2 + xRot * perspective;
    const sy = pointCloudCanvas.height / 2 + yRot * perspective;
    const radius = Math.max(1.2, 2.3 + zFinal * 0.015);

    pointCtx.fillStyle = point.color;
    pointCtx.beginPath();
    pointCtx.arc(sx, sy, radius, 0, Math.PI * 2);
    pointCtx.fill();
  }
}

imageInput.addEventListener('change', (event) => {
  const file = event.target.files?.[0];
  if (!file) {
    loadedImage = null;
    convertButton.disabled = true;
    drawPlaceholder();
    return;
  }

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    const img = new Image();
    img.onload = () => {
      loadedImage = img;
      drawImagePreview(img);
      convertButton.disabled = false;
    };
    img.src = loadEvent.target.result;
  };
  reader.readAsDataURL(file);
});

convertButton.addEventListener('click', renderPointCloud);

resetButton.addEventListener('click', () => {
  loadedImage = null;
  imageInput.value = '';
  convertButton.disabled = true;
  drawPlaceholder();
});

drawPlaceholder();
