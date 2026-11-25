// Uploads an image file or image URL to ImgBB and returns the public URL.
export async function uploadToImgBB(image, apiKey) {
  if (!apiKey) throw new Error("IMGBB_API_KEY is not configured.");

  let encodedImage;
  if (typeof image === "string") {
    encodedImage = image;
  } else if (image?.buffer) {
    encodedImage = image.buffer.toString("base64");
  } else {
    throw new Error("An image file or URL is required.");
  }

  const body = new URLSearchParams({ image: encodedImage });
  const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body,
  });
  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "Image upload failed.");
  }
  return payload.data.url;
}
