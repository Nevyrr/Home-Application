// ImageUpload.tsx
import React, { useState } from 'react';
import { uploadFile } from '../controllers/TacoController.ts';

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [imageURL, setImageURL] = useState<string>('');
    const [message, setMessage] = useState<string>('');

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        
        try {
            await uploadFile(selectedFile);
            setMessage('Image uploaded successfully');
            setImageURL(URL.createObjectURL(selectedFile)); // For immediate preview
        } catch (error) {
            setMessage('Error uploading image');
        }
    };

    return (
        <div>
            <h1>Upload and View Image</h1>
            <input type="file" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload</button>
            {message && <p>{message}</p>}
            {imageURL && <img src={imageURL} alt="Preview" style={{ width: '200px', height: 'auto' }} />}
        </div>
    );
};

export default ImageUpload;

