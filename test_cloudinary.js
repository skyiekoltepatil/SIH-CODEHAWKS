async function testUpload() {
  const cloudName = 'b587e25c-aed3-4d1b-bd30-6b2e9e40775e';
  const uploadPreset = 'documents database';

  const formData = new FormData();
  // Create a dummy text file
  formData.append('file', new Blob(['test content'], { type: 'text/plain' }), 'test.txt');
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', cloudName);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });
    
    const text = await response.text();
    console.log("Status:", response.status);
    console.log("Response:", text);
  } catch (e) {
    console.error("Fetch failed:", e);
  }
}
testUpload();
