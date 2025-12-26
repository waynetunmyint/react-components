export const resizeImage = (base64Str, targetWidth = 500) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = base64Str;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
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