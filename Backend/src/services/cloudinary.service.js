import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env.js';

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret
});

export const getOptimizedCloudinaryImageUrl = (url) => {
    if (!url || typeof url !== 'string' || !url.includes('/image/upload/')) {
        return url;
    }

    try {
        const parts = url.split('/upload/');
        if (parts.length !== 2) return url;
        const [prefix, suffix] = parts;
        const segments = suffix.split('/');
        const cleanSegments = segments.filter((seg) => {
            if (/^v\d+$/i.test(seg)) return true;
            if (seg.includes(',') || seg.includes('f_') || seg.includes('q_') || seg.includes('w_') || seg.includes('h_') || seg.includes('c_')) {
                return false;
            }
            return true;
        });
        return `${prefix}/upload/${cleanSegments.join('/')}`;
    } catch {
        return url;
    }
};

const getImageUploadOptions = (folder) => ({
    folder,
    resource_type: 'image',
    format: 'webp',
    quality: 'auto'
});

export const uploadImageBuffer = async (buffer, folder = 'uploads') => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            getImageUploadOptions(folder),
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve(getOptimizedCloudinaryImageUrl(result.secure_url));
            }
        );

        stream.end(buffer);
    });
};

export const uploadImageBufferDetailed = async (buffer, folder = 'uploads') => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            getImageUploadOptions(folder),
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                return resolve({
                    ...result,
                    secure_url: getOptimizedCloudinaryImageUrl(result.secure_url)
                });
            }
        );

        stream.end(buffer);
    });
};

export const uploadBufferDetailed = async (
    buffer,
    { folder = 'uploads', resourceType = 'auto' } = {}
) => {
    if (!buffer) {
        throw new Error('File buffer is required');
    }

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            resourceType === 'image'
                ? getImageUploadOptions(folder)
                : { folder, resource_type: resourceType },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                if (resourceType === 'image') {
                    return resolve({
                        ...result,
                        secure_url: getOptimizedCloudinaryImageUrl(result.secure_url)
                    });
                }

                return resolve(result);
            }
        );

        stream.end(buffer);
    });
};
