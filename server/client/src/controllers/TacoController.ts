import { Taco } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";

interface ApiResponse {
  taco?: Taco[];
  success?: string;
  error?: string;
}

const emptyTacoData: Taco = {
  vermifugeDate: "",
  vermifugeReminder: "",
  antiPuceDate: "",
  antiPuceReminder: "",
  annualVaccineDate: "",
  annualVaccineReminder: "",
};

/**************************** Get Taco Data  ********************************/
const getTacoData = async (): Promise<Taco> => {
  const res = await fetchWithAuth("/api/taco/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch taco data");
  }

  const tacoArray = data.data?.taco || data.taco || [];
  const tacoData =
    Array.isArray(tacoArray) && tacoArray.length > 0
      ? ({ ...emptyTacoData, ...tacoArray[0] } as Taco)
      : emptyTacoData;

  return tacoData;
};

const updateVermifugeDate = async (date: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth("/api/taco/vermifuge/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const res = await fetchWithAuth("/api/taco/vermifuge/reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const res = await fetchWithAuth("/api/taco/antipuce/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const res = await fetchWithAuth("/api/taco/antipuce/reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update anti-puce reminder");
  }

  return data;
};

const updateAnnualVaccineDate = async (date: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth("/api/taco/vaccine/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update annual vaccine date");
  }

  return data;
};

const updateAnnualVaccineReminder = async (date: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth("/api/taco/vaccine/reminder", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date }),
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update annual vaccine reminder");
  }

  return data;
};

const getFile = async (filename: string): Promise<Blob> => {
  const res = await fetchWithAuth(`/api/taco/image/${filename}`, {
    method: "GET",
  });

  if (!res.ok) {
    throw Error("Failed to get file");
  }

  return res.blob();
};

const uploadFile = async (selectedFile: File): Promise<ApiResponse> => {
  console.log("uploadFile appelÃ© avec:", selectedFile.name, selectedFile.type, selectedFile.size);

  if (!selectedFile) {
    throw Error("Veuillez sÃ©lectionner un fichier");
  }

  if (selectedFile.type !== "image/png" && selectedFile.type !== "image/jpeg" && selectedFile.type !== "image/jpg") {
    throw Error("Seuls les fichiers PNG et JPG sont acceptÃ©s");
  }

  const formData = new FormData();
  formData.append("image", selectedFile);

  console.log("Envoi de la requÃªte POST vers /api/taco/upload");

  const res = await fetchWithAuth("/api/taco/upload", {
    method: "POST",
    body: formData,
  });

  console.log("RÃ©ponse reÃ§ue:", res.status, res.statusText);

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw Error(text || "Erreur serveur lors de l'upload");
  }

  let data: any;
  try {
    const text = await res.text();
    if (!text) {
      throw Error("RÃ©ponse vide du serveur");
    }
    data = JSON.parse(text);
  } catch {
    throw Error("Erreur lors de la lecture de la rÃ©ponse du serveur");
  }

  if (!res.ok) {
    throw Error(data.error || data.message || "Ã‰chec de l'upload du fichier");
  }

  return { success: data.message || data.success, filename: data.data?.filename, ...data };
};

interface ImageInfo {
  filename: string;
  uploadDate: string;
  length: number;
}

const listImages = async (): Promise<{ images: ImageInfo[] }> => {
  const res = await fetchWithAuth("/api/taco/images", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Ã‰chec de la rÃ©cupÃ©ration des images");
  }

  const images = data.data?.images || data.images || [];
  return { images };
};

const deleteImage = async (filename: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/taco/image/${filename}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Ã‰chec de la suppression de l'image");
  }
};

export {
  getTacoData,
  getFile,
  updateVermifugeDate,
  updateVermifugeReminder,
  updateAntiPuceDate,
  updateAntiPuceReminder,
  updateAnnualVaccineDate,
  updateAnnualVaccineReminder,
  uploadFile,
  listImages,
  deleteImage,
};
