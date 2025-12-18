import { Taco } from "../types/index.ts";

interface ApiResponse {
  taco?: Taco[];
  success?: string;
  error?: string;
}

/**************************** Get Taco Data  ********************************/
const getTacoData = async (): Promise<Taco> => {
  const res = await fetch("/api/taco/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch taco data");
  }

  // Gérer le nouveau format de réponse (data.data.taco) ou l'ancien (data.taco)
  const tacoArray = data.data?.taco || data.taco || [];
  const tacoData = Array.isArray(tacoArray) && tacoArray.length > 0 
    ? tacoArray[0] 
    : {
        vermifugeDate: "",
        vermifugeReminder: "",
        antiPuceDate: "",
        antiPuceReminder: "",
      } as Taco;
  
  return tacoData;
};

const updateVermifugeDate = async (date: string): Promise<ApiResponse> => {
  const res = await fetch("/api/taco/vermifuge/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update vermifuge date");
  }

  return data;
};

const updateVermifugeReminder = async (date: string): Promise<ApiResponse> => {
  const res = await fetch("/api/taco/vermifuge/reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update vermifuge reminder");
  }

  return data;
};

const updateAntiPuceDate = async (date: string): Promise<ApiResponse> => {
  const res = await fetch("/api/taco/antipuce/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update anti-puce date");
  }

  return data;
};

const updateAntiPuceReminder = async (date: string): Promise<ApiResponse> => {
  const res = await fetch("/api/taco/antipuce/reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update anti-puce reminder");
  }

  return data;
};

const getFile = async (filename: string): Promise<Blob> => {
  const res = await fetch(`/api/taco/image/${filename}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) {
    throw Error("Failed to get file");
  }

  return res.blob();
};

const uploadFile = async (selectedFile: File): Promise<ApiResponse> => {
  console.log('uploadFile appelé avec:', selectedFile.name, selectedFile.type, selectedFile.size);
  
  if (!selectedFile) {
    throw Error("Veuillez sélectionner un fichier");
  }

  // Vérifier que c'est un PNG ou JPG
  if (selectedFile.type !== 'image/png' && selectedFile.type !== 'image/jpeg' && selectedFile.type !== 'image/jpg') {
    throw Error("Seuls les fichiers PNG et JPG sont acceptés");
  }

  const formData = new FormData();
  formData.append("image", selectedFile);
  
  const token = localStorage.getItem("token");
  console.log('Envoi de la requête POST vers /api/taco/upload', { hasToken: !!token });
  
  const res = await fetch("/api/taco/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  
  console.log('Réponse reçue:', res.status, res.statusText);

  // Vérifier que la réponse contient du contenu avant de parser le JSON
  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Erreur serveur lors de l'upload");
  }

  let data: any;
  try {
    const text = await res.text();
    if (!text) {
      throw Error("Réponse vide du serveur");
    }
    data = JSON.parse(text);
  } catch (error) {
    throw Error("Erreur lors de la lecture de la réponse du serveur");
  }

  if (!res.ok) {
    throw Error(data.error || data.message || "Échec de l'upload du fichier");
  }

  return { success: data.message || data.success, filename: data.data?.filename, ...data };
};

interface ImageInfo {
  filename: string;
  uploadDate: string;
  length: number;
}

const listImages = async (): Promise<{ images: ImageInfo[] }> => {
  const res = await fetch("/api/taco/images", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Échec de la récupération des images");
  }

  const images = data.data?.images || data.images || [];
  return { images };
};

const deleteImage = async (filename: string): Promise<void> => {
  const res = await fetch(`/api/taco/image/${filename}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Échec de la suppression de l'image");
  }
};

export { getTacoData, getFile, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder, uploadFile, listImages, deleteImage };

