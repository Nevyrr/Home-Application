// ImageUpload.js
import React, { useState } from 'react';

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageURL, setImageURL] = useState('');
    const [message, setMessage] = useState('');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        try {
            uploadFile(selectedFile);
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
}

export default ImageUpload;