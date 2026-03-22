import { ChangeEvent, useEffect, useRef, useState } from "react";
import { deleteImage, getFile, listImages, uploadFile } from "../controllers/TacoController.ts";

interface ImageInfo {
  filename: string;
  uploadDate: string;
  length: number;
}

const ACCEPTED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/jpg"]);

const formatUploadDate = (uploadDate: string): string => {
  const parsedDate = new Date(uploadDate);
  return Number.isNaN(parsedDate.getTime()) ? "Date inconnue" : parsedDate.toLocaleDateString("fr-FR");
};

const formatFileSize = (fileLength: number): string => {
  if (fileLength <= 0) {
    return "Taille inconnue";
  }

  if (fileLength < 1024 * 1024) {
    return `${Math.max(1, Math.round(fileLength / 1024))} Ko`;
  }

  return `${(fileLength / (1024 * 1024)).toFixed(1)} Mo`;
};

const ImageUpload = ({ canWrite = true }: { canWrite?: boolean }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadImages = async (): Promise<void> => {
    try {
      const data = await listImages();
      const nextImages = [...(data.images || [])].sort(
        (firstImage, secondImage) => new Date(secondImage.uploadDate).getTime() - new Date(firstImage.uploadDate).getTime()
      );

      setImages(nextImages);

      const entries = await Promise.all(
        nextImages.map(async (image) => {
          try {
            const blob = await getFile(image.filename);
            return [image.filename, URL.createObjectURL(blob)] as const;
          } catch (error) {
            console.error(`Erreur lors du chargement de l'image ${image.filename}:`, error);
            return null;
          }
        })
      );

      setImageUrls((previousUrls) => {
        Object.values(previousUrls).forEach((url) => URL.revokeObjectURL(url));
        return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry !== null));
      });
    } catch (error) {
      console.error("Erreur lors du chargement des images:", error);
    }
  };

  useEffect(() => {
    void loadImages();
  }, []);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imageUrls]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!canWrite) {
      return;
    }

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setMessage("Seuls les fichiers PNG et JPG sont acceptes");
      setMessageType("error");
      setSelectedFile(null);
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setMessage("");
  };

  const handleUpload = async (): Promise<void> => {
    if (!canWrite) {
      return;
    }

    if (loading) {
      return;
    }

    if (!selectedFile) {
      setMessage("Veuillez selectionner un fichier");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await uploadFile(selectedFile);
      setMessage("Image envoyee avec succes");
      setMessageType("success");
      setSelectedFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await loadImages();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur lors de l'envoi");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filename: string): Promise<void> => {
    if (!canWrite) {
      return;
    }

    if (!window.confirm("Etes-vous sur de vouloir supprimer cette ordonnance ?")) {
      return;
    }

    try {
      await deleteImage(filename);

      setImageUrls((previousUrls) => {
        const nextUrls = { ...previousUrls };
        const existingUrl = nextUrls[filename];

        if (existingUrl) {
          URL.revokeObjectURL(existingUrl);
          delete nextUrls[filename];
        }

        return nextUrls;
      });

      setMessage("Ordonnance supprimee avec succes");
      setMessageType("success");
      await loadImages();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erreur lors de la suppression");
      setMessageType("error");
    }
  };

  return (
    <div className="taco-upload-shell">
      <div className="taco-upload-toolbar">
        <label htmlFor="file-input" className={`ghost-button taco-upload-picker ${!canWrite ? "pointer-events-none opacity-60" : ""}`}>
          <i className="fa-solid fa-upload"></i>
          Choisir un fichier
        </label>

        <input
          ref={fileInputRef}
          id="file-input"
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileChange}
          disabled={!canWrite}
          className="hidden"
        />

        <div className={`taco-file-pill ${selectedFile ? "is-selected" : ""}`}>
          <i className={`fa-solid ${selectedFile ? "fa-file-image" : "fa-paperclip"}`}></i>
          <span>{selectedFile ? selectedFile.name : "PNG ou JPG uniquement"}</span>
        </div>

        <button
          type="button"
          onClick={() => void handleUpload()}
          disabled={!canWrite || !selectedFile || loading}
          className="btn taco-upload-submit"
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              Envoi en cours...
            </>
          ) : (
            <>
              <i className="fa-solid fa-cloud-arrow-up"></i>
              Envoyer l'ordonnance
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`taco-upload-message ${messageType}`}>
          <i className={`fa-solid ${messageType === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`}></i>
          <span>{message}</span>
        </div>
      )}

      <div className="taco-gallery-head">
        <div>
          <p className="eyebrow">Documents</p>
          <h3>Ordonnances enregistrees</h3>
        </div>
        <span className="taco-gallery-count">{images.length}</span>
      </div>

      {images.length === 0 ? (
        <div className="taco-empty-state">
          <i className="fa-solid fa-folder-open"></i>
          <p>Aucune ordonnance enregistree pour le moment.</p>
          <small>Ajoutez une photo ici pour garder les documents utiles accessibles rapidement.</small>
        </div>
      ) : (
        <div className="taco-gallery-grid">
          {images.map((image, index) => (
            <article key={image.filename} className="taco-gallery-card">
              <button
                type="button"
                onClick={() => void handleDelete(image.filename)}
                className="icon-button taco-gallery-delete"
                aria-label="Supprimer l'ordonnance"
                title="Supprimer l'ordonnance"
                disabled={!canWrite}
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>

              <button
                type="button"
                className="taco-gallery-preview"
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
                    onError={(event) => {
                      const target = event.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <span className="taco-gallery-placeholder">
                    <i className="fa-solid fa-spinner fa-spin"></i>
                  </span>
                )}
              </button>

              <div className="taco-gallery-body">
                <p className="taco-gallery-name" title={image.filename}>
                  {image.filename}
                </p>
                <p className="taco-gallery-meta">
                  <i className="fa-solid fa-calendar-days"></i>
                  <span>{formatUploadDate(image.uploadDate)}</span>
                </p>
                <p className="taco-gallery-meta">
                  <i className="fa-solid fa-weight-hanging"></i>
                  <span>{formatFileSize(image.length)}</span>
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="taco-lightbox" onClick={() => setSelectedImage(null)}>
          <div className="taco-lightbox-dialog" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="icon-button taco-lightbox-close"
              aria-label="Fermer"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
            <img
              src={selectedImage}
              alt="Ordonnance"
              className="taco-lightbox-image"
              onClick={(event) => event.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
