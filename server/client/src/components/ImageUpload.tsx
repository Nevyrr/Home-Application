// ImageUpload.tsx
import React, { useState, useEffect } from 'react';
import { uploadFile, listImages, deleteImage, getFile } from '../controllers/TacoController.ts';

interface ImageInfo {
    filename: string;
    uploadDate: string;
    length: number;
}

const ImageUpload = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [message, setMessage] = useState<string>('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [images, setImages] = useState<ImageInfo[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Charger la liste des images au montage
    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            const data = await listImages();
            setImages(data.images || []);
            
            // Précharger les URLs blob pour toutes les images
            const urls: Record<string, string> = {};
            for (const image of data.images || []) {
                try {
                    const blob = await getFile(image.filename);
                    urls[image.filename] = URL.createObjectURL(blob);
                } catch (error) {
                    console.error(`Erreur lors du chargement de l'image ${image.filename}:`, error);
                }
            }
            setImageUrls(urls);
        } catch (error) {
            console.error('Erreur lors du chargement des images:', error);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // Vérifier que c'est un PNG ou JPG
            if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
                setMessage('Seuls les fichiers PNG et JPG sont acceptés');
                setMessageType('error');
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setMessage('');
        }
    };

    const handleUpload = async () => {
        console.log('handleUpload appelé', { loading, selectedFile: selectedFile?.name });
        
        // Empêcher les appels multiples simultanés
        if (loading) {
            console.log('Upload déjà en cours, ignoré');
            return;
        }

        if (!selectedFile) {
            console.log('Aucun fichier sélectionné');
            setMessage('Veuillez sélectionner un fichier');
            setMessageType('error');
            return;
        }

        console.log('Début de l\'upload:', selectedFile.name, selectedFile.type, selectedFile.size);
        setLoading(true);
        setMessage('');

        try {
            console.log('Appel de uploadFile...');
            await uploadFile(selectedFile);
            console.log('Upload réussi');
            setMessage('Image uploadée avec succès !');
            setMessageType('success');
            setSelectedFile(null);
            // Réinitialiser l'input file
            const fileInput = document.getElementById('file-input') as HTMLInputElement;
            if (fileInput) {
                fileInput.value = '';
            }
            // Recharger la liste des images
            await loadImages();
        } catch (error) {
            console.error('Erreur upload:', error);
            setMessage(error instanceof Error ? error.message : 'Erreur lors de l\'upload');
            setMessageType('error');
        } finally {
            setLoading(false);
        }
    };

    const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

    const getImageUrl = async (filename: string): Promise<string> => {
        // Si l'URL blob existe déjà, la retourner
        if (imageUrls[filename]) {
            return imageUrls[filename];
        }

        // Sinon, charger l'image et créer une blob URL
        try {
            const blob = await getFile(filename);
            const url = URL.createObjectURL(blob);
            setImageUrls(prev => ({ ...prev, [filename]: url }));
            return url;
        } catch (error) {
            console.error('Erreur lors du chargement de l\'image:', error);
            return '';
        }
    };

    return (
        <div className="mt-6">
            <div className="mb-6 p-5 rounded-xl border border-theme bg-bg-panel shadow-sm">
                <h2 className="text-xl font-semibold mb-5 text-text-heading flex items-center gap-2">
                    <i className="fa-solid fa-file-upload text-primary"></i>
                    Uploader une ordonnance
                </h2>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <label 
                        htmlFor="file-input" 
                        className="upload-button cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-200"
                        style={{ 
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: '1px solid var(--btn-border)',
                            boxShadow: 'var(--shadow-md)',
                            marginBottom: 0
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--btn-hover-bg)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--primary)';
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                    >
                        <i className="fa-solid fa-upload"></i>
                        Choisir un fichier (PNG/JPG)
                    </label>
                    <input
                        id="file-input"
                        type="file"
                        accept="image/png,image/jpeg,image/jpg"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    
                    {selectedFile && (
                        <span className="text-sm text-text-muted flex items-center">
                            <i className="fa-solid fa-file-image mr-2"></i>
                            {selectedFile.name}
                        </span>
                    )}
                    
                    <button 
                        type="button"
                        onClick={handleUpload} 
                        disabled={!selectedFile || loading}
                        className="validate-button inline-flex items-center justify-center gap-2"
                        style={{ marginBottom: 0 }}
                    >
                        {loading ? (
                            <>
                                <i className="fa-solid fa-spinner fa-spin"></i>
                                Upload en cours...
                            </>
                        ) : (
                            <>
                                <i className="fa-solid fa-cloud-upload-alt"></i>
                                Uploader
                            </>
                        )}
                    </button>
                </div>

                {message && (
                    <div className={`mt-4 p-3 rounded-lg border ${
                        messageType === 'success' 
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700' 
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-300 dark:border-red-700'
                    }`}>
                        <div className="flex items-center gap-2">
                            <i className={`fa-solid ${messageType === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation'}`}></i>
                            <span>{message}</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-5 text-text-heading flex items-center gap-2">
                    <i className="fa-solid fa-folder-open text-primary"></i>
                    Ordonnances uploadées ({images.length})
                </h2>
                
                {images.length === 0 ? (
                    <p className="text-text-muted italic">Aucune image uploadée pour le moment</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                        {images.map((image, index) => (
                            <div 
                                key={index} 
                                className="border border-theme rounded-xl overflow-hidden bg-bg-panel hover:shadow-lg transition-all hover:border-primary/30 relative group"
                            >
                                <div 
                                    className="aspect-square bg-hover flex items-center justify-center cursor-pointer"
                                    onClick={() => {
                                        const url = imageUrls[image.filename];
                                        if (url) {
                                            setSelectedImage(url);
                                        }
                                    }}
                                >
                                    {imageUrls[image.filename] ? (
                                    <img 
                                        src={imageUrls[image.filename]} 
                                        alt={`Ordonnance ${index + 1}`}
                                        className="max-w-full max-h-full object-contain p-2"
                                            onError={(e) => {
                                                const target = e.target as HTMLImageElement;
                                                target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';
                                            }}
                                        />
                                    ) : (
                                        <div className="text-text-muted">
                                            <i className="fa-solid fa-spinner fa-spin"></i>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4">
                                    <p className="text-sm font-medium text-text-main truncate" title={image.filename}>
                                        {image.filename}
                                    </p>
                                    <p className="text-xs text-text-muted mt-2 flex items-center gap-1">
                                        <i className="fa-solid fa-calendar text-[10px]"></i>
                                        {new Date(image.uploadDate).toLocaleDateString('fr-FR')}
                                    </p>
                                </div>
                                <button
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ordonnance ?')) {
                                            try {
                                                await deleteImage(image.filename);
                                                // Libérer la blob URL
                                                if (imageUrls[image.filename]) {
                                                    URL.revokeObjectURL(imageUrls[image.filename]);
                                                }
                                                setMessage('Ordonnance supprimée avec succès');
                                                setMessageType('success');
                                                await loadImages();
                                            } catch (error) {
                                                setMessage(error instanceof Error ? error.message : 'Erreur lors de la suppression');
                                                setMessageType('error');
                                            }
                                        }
                                    }}
                                    className="absolute top-2 right-2 bg-bg-panel border border-theme text-text-main rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-hover hover:border-red-500/50 hover:text-red-500 dark:hover:text-red-400 shadow-md z-10"
                                    aria-label="Supprimer l'ordonnance"
                                    title="Supprimer l'ordonnance"
                                >
                                    <i className="fa-solid fa-trash-can text-sm"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal pour voir l'image en grand */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative max-w-7xl max-h-full">
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75 transition-all z-10"
                            aria-label="Fermer"
                        >
                            <i className="fa-solid fa-times text-xl"></i>
                        </button>
                        <img 
                            src={selectedImage} 
                            alt="Ordonnance"
                            className="max-w-full max-h-[90vh] object-contain"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUpload;

