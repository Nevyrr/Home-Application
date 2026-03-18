import { Taco } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

interface ImageInfo {
  filename: string;
  uploadDate: string;
  length: number;
}

interface ApiResponse extends ApiEnvelope<{ taco?: Taco[]; images?: ImageInfo[]; filename?: string }> {
  taco?: Taco[];
  images?: ImageInfo[];
  filename?: string;
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
  birthDate: "07/08/2022",
  weightKg: 16.7,
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const buildSuccessResponse = (data: ApiResponse): ApiResponse => ({
  ...data,
  success: getApiMessage(data),
});

const postTacoUpdate = async (path: string, date: string, fallbackMessage: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(path, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify({ date }),
  });

  const data = await readApiResponse<ApiResponse>(res, fallbackMessage);
  return buildSuccessResponse(data);
};

const getTacoData = async (): Promise<Taco> => {
  const res = await fetchWithAuth("/api/taco/", {
    method: "GET",
    headers: jsonHeaders,
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to fetch taco data");
  const tacoArray = data.data?.taco || data.taco || [];

  return Array.isArray(tacoArray) && tacoArray.length > 0 ? { ...emptyTacoData, ...tacoArray[0] } : emptyTacoData;
};

const updateVermifugeDate = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/vermifuge/date", date, "Failed to update vermifuge date");

const updateVermifugeReminder = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/vermifuge/reminder", date, "Failed to update vermifuge reminder");

const updateAntiPuceDate = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/antipuce/date", date, "Failed to update anti-puce date");

const updateAntiPuceReminder = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/antipuce/reminder", date, "Failed to update anti-puce reminder");

const updateAnnualVaccineDate = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/vaccine/date", date, "Failed to update annual vaccine date");

const updateAnnualVaccineReminder = async (date: string): Promise<ApiResponse> =>
  postTacoUpdate("/api/taco/vaccine/reminder", date, "Failed to update annual vaccine reminder");

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
  if (!selectedFile) {
    throw Error("Veuillez selectionner un fichier");
  }

  if (selectedFile.type !== "image/png" && selectedFile.type !== "image/jpeg" && selectedFile.type !== "image/jpg") {
    throw Error("Seuls les fichiers PNG et JPG sont acceptes");
  }

  const formData = new FormData();
  formData.append("image", selectedFile);

  const res = await fetchWithAuth("/api/taco/upload", {
    method: "POST",
    body: formData,
  });

  const data = await readApiResponse<ApiResponse>(res, "Echec de l'upload du fichier");

  return {
    ...buildSuccessResponse(data),
    filename: data.data?.filename || data.filename,
  };
};

const listImages = async (): Promise<{ images: ImageInfo[] }> => {
  const res = await fetchWithAuth("/api/taco/images", {
    method: "GET",
    headers: jsonHeaders,
  });

  const data = await readApiResponse<ApiResponse>(res, "Echec de la recuperation des images");

  return {
    images: data.data?.images || data.images || [],
  };
};

const deleteImage = async (filename: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/taco/image/${filename}`, {
    method: "DELETE",
    headers: jsonHeaders,
  });

  await readApiResponse<ApiResponse>(res, "Echec de la suppression de l'image");
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
