export const uploadResumeToCloudinary = async (file: File) => {
  const formData = new FormData();

  formData.append("file", file);
  formData.append(
    "upload_preset",
    import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
  );

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Cloudinary upload failed");
  }

  const data = await response.json();

  return {
    url: data.secure_url,
    publicId: data.public_id,
    originalName: data.original_filename,
  };
};