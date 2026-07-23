import cloudinary from '@/lib/cloudinary';

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  filename: string,
  folder: string = 'campusai_learning_resources'
): Promise<{ url: string; publicId: string }> {
  const isCloudinaryConfigured = Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

  if (!isCloudinaryConfigured) {
    console.warn('⚠️ Cloudinary keys missing in environment. Generating fallback resource URL.');
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return {
      url: `https://res.cloudinary.com/demo/image/upload/v1700000000/campusai_learning_resources/${sanitizedFilename}`,
      publicId: `campusai_learning_resources/${sanitizedFilename}`,
    };
  }

  const base64Data = fileBuffer.toString('base64');
  const mimeType = getMimeType(filename);
  const dataUri = `data:${mimeType};base64,${base64Data}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
      public_id: `${Date.now()}_${filename.replace(/\.[^/.]+$/, '')}`,
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('[CloudinaryService] Upload error:', error);
    throw new Error(`Cloudinary upload failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'doc':
      return 'application/msword';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'ppt':
      return 'application/vnd.ms-powerpoint';
    case 'pptx':
      return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    default:
      return 'application/octet-stream';
  }
}
