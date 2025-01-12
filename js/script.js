window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');
    const imageUpload = document.getElementById('image-upload');
    const countDisplay = document.getElementById('count');
    const differenceDisplay = document.getElementById('difference');
    const percentDifferenceDisplay = document.getElementById('percent-difference');
    const showDifferenceButton = document.getElementById('show-difference');

    let isDrawing = false;
    const shadedPixels = new Set();
    const originalPixels = new Set();
    let shadingCount = 0;
    let prevShadingCount = -1;
    let currentPic = 1;

    imageUpload.addEventListener('change', handleImageUpload);
    showDifferenceButton.addEventListener('click', showDifference);

    function handleImageUpload(event) {
      const file = event.target.files[0];
      const reader = new FileReader();

      reader.onload = function() {
        const img = new Image();
        img.onload = function() {
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          context.drawImage(img, 0, 0, width, height);

          // Store the original pixel positions
          originalPixels.clear();
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % canvas.width;
            const y = Math.floor((i / 4) / canvas.width);
            originalPixels.add(`${x}-${y}`);
          }

          // Compare shaded areas with the previous image
          if (prevShadingCount > 0 && currentPic === 2) {
            const difference = shadingCount - prevShadingCount;
            const percentDifference = ((difference / prevShadingCount) * 100).toFixed(2);

            console.log('Difference in shaded pixels:', difference);
            console.log('Percent difference:', percentDifference);

            // Display the difference in the UI
        
            countDisplay.textContent = `Number of pixels shaded in pic #1: ${prevShadingCount}`;
            differenceDisplay.textContent = `Number of pixels shaded in pic #2: ${shadingCount}`;

            // Display the percent difference in the UI
            percentDifferenceDisplay.textContent = `Percent difference: ${percentDifference}% [${difference}/${prevShadingCount} x 100]`;
          }

          prevShadingCount = shadingCount;
          shadingCount = 0;
          shadedPixels.clear();
          currentPic = 2;
        };

        img.src = reader.result;
      };

      reader.readAsDataURL(file);
    }

    function countShadedPixels() {
      if (!canvas.toDataURL()) {
        // No image loaded, reset shading count and exit function
        shadingCount = 0;
        countDisplay.textContent = 'Number of shaded pixels: 0';
        return;
      }

      shadingCount = 0;

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (const shadedPixel of shadedPixels) {
        if (originalPixels.has(shadedPixel)) {
          const [x, y] = shadedPixel.split('-').map(Number);
          const pixelIndex = y * canvas.width + x;
          const red = data[pixelIndex * 4];
          const green = data[pixelIndex * 4 + 1];
          const blue = data[pixelIndex * 4 + 2];

          // if (red < 100 && green < 100 && blue < 100) {
          shadingCount++;
          // }
        }
      }

      //countDisplay.textContent = 'Number of shaded pixels: ' + shadingCount;
      countDisplay.textContent = `Number of shaded pixels: ${shadingCount}`;
    }

    function showDifference() {
// Compare shaded areas with the previous image
if (prevShadingCount > 0 && currentPic === 2) {
  const difference = prevShadingCount - shadingCount;
  const percentDifference = ((difference / prevShadingCount) * 100).toFixed(2);

  console.log('Difference in shaded pixels:', difference);
  console.log('Percent difference:', percentDifference);

  // Display the difference in the UI
  differenceDisplay.textContent = `Number of pixels shaded in pic #1: ${prevShadingCount}`;
  countDisplay.textContent = `Number of pixels shaded in pic #2: ${shadingCount}`;

  // Display the percent difference in the UI
  percentDifferenceDisplay.textContent = `Percent difference: ${percentDifference}% [${difference}/${prevShadingCount} x 100]`;
}
}


    canvas.addEventListener('touchstart', (event) => {
      isDrawing = true;
    });

    canvas.addEventListener('touchend', () => {
      isDrawing = false;
    });

    canvas.addEventListener('touchmove', handleTouch);

    function handleTouch(event) {
      event.preventDefault();

      if (isDrawing) {
        const rect = canvas.getBoundingClientRect();
        const touchX = Math.floor((event.touches[0].clientX - rect.left) * (canvas.width / rect.width));
        const touchY = Math.floor((event.touches[0].clientY - rect.top) * (canvas.height / rect.height));

        context.fillStyle = 'green';
        context.fillRect(touchX, touchY, 10, 10);

        // Store shaded pixels in the Set
        for (let x = touchX; x < touchX + 10; x++) {
          for (let y = touchY; y < touchY + 10; y++) {
            shadedPixels.add(`${x}-${y}`);
          }
        }

        countShadedPixels();
      }
    }
  });