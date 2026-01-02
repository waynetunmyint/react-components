export const resizeImage = (base64Str: any, targetWidth = 500) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64Str;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject("Could not get canvas context");
        return;
      }

      // Calculate the aspect ratio
      const aspectRatio = img.height / img.width;
      const targetHeight = targetWidth * aspectRatio;

      // Set canvas size based on the target width and aspect ratio
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw the resized image onto the canvas
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Return the resized image as a base64 string
      const resizedBase64 = canvas.toDataURL();
      resolve(resizedBase64);
    };

    img.onerror = (err) => {
      reject("Error resizing image");
    };
  });
};

export const dataURItoBlob = (dataURI: string) => {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
};