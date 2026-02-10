import cloudinary from 'cloudinary'
import { CLOUDINARY } from '../config/index.js'
import steamifier from 'streamifier';

cloudinary.v2.config(CLOUDINARY);

export const uploadVideoBuffer = (buffer,folder = 'vidoes') =>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            {folder,resource_type:"video", chunk_size:6000000},
            (error,result)=>{
                if(error) return reject(error);
                resolve(result);
            }
        );
        steamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

export const uploadImageBuffer = (buffer,folder='thumbnails')=>{
    return new Promise((resolve,reject)=>{
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            {folder,resource_type:"image"}, (error,result)=>{
                if(error) return reject(error);
                resolve(result);
            }
        );
        steamifier.createReadStream(buffer).pipe(uploadStream);
    })
}

