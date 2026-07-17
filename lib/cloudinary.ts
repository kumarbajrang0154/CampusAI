// lib/cloudinary.ts — Cloudinary Configuration Placeholder
import { v2 as cloudinary } from 'cloudinary';

let warned = false;
const checkConfig = () => {
  if (!warned) {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.warn('⚠️ WARNING: Cloudinary environment variables are missing. Image uploads will fail on execution.');
    }
    warned = true;
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudinaryProxy = new Proxy(cloudinary, {
  get(target, prop, receiver) {
    checkConfig();
    return Reflect.get(target, prop, receiver);
  }
});

export default cloudinaryProxy;
