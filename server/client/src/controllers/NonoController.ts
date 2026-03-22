import { Nono } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

interface ApiResponse extends ApiEnvelope<{ nono?: Nono[] }> {
  nono?: Nono[];
  success?: string;
  error?: string;
}

const DEFAULT_NONO_BIRTH_DATE = "18/03/2026";

const emptyNonoData: Nono = {
  birthDate: DEFAULT_NONO_BIRTH_DATE,
  checkupDate: "",
  checkupReminder: "",
  vaccineDate: "",
  vaccineReminder: "",
  vitaminReminder: "",
  administrativeReminder: "",
  notes: "",
  bottleEntries: [],
  weightEntries: [],
};

const jsonHeaders = {
  "Content-Type": "application/json",
};

const buildSuccessResponse = (data: ApiResponse): ApiResponse => ({
  ...data,
  success: getApiMessage(data),
});

const postNonoUpdate = async (
  path: string,
  payload: Record<string, string | number | boolean>,
  fallbackMessage: string
): Promise<ApiResponse> => {
  const res = await fetchWithAuth(path, {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  const data = await readApiResponse<ApiResponse>(res, fallbackMessage);
  return buildSuccessResponse(data);
};

const deleteNonoEntry = async (path: string, fallbackMessage: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(path, {
    method: "DELETE",
    headers: jsonHeaders,
  });

  const data = await readApiResponse<ApiResponse>(res, fallbackMessage);
  return buildSuccessResponse(data);
};

const getNonoData = async (): Promise<Nono> => {
  const res = await fetchWithAuth("/api/nono/", {
    method: "GET",
    headers: jsonHeaders,
  });

  const data = await readApiResponse<ApiResponse>(res, "Impossible de charger les donnees de Nono");
  const nonoArray = data.data?.nono || data.nono || [];

  return Array.isArray(nonoArray) && nonoArray.length > 0 ? { ...emptyNonoData, ...nonoArray[0] } : emptyNonoData;
};

const updateBirthDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/birth/date", { date }, "Impossible de mettre a jour la date de naissance");

const updateCheckupDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/checkup/date", { date }, "Impossible de mettre a jour la date du rendez-vous");

const updateCheckupReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/checkup/reminder", { date }, "Impossible de mettre a jour le rappel du rendez-vous");

const updateVaccineDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vaccine/date", { date }, "Impossible de mettre a jour la date du vaccin");

const updateVaccineReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vaccine/reminder", { date }, "Impossible de mettre a jour le rappel du vaccin");

const updateVitaminReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vitamin/reminder", { date }, "Impossible de mettre a jour le rappel vitamine");

const updateAdministrativeReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/administrative/reminder", { date }, "Impossible de mettre a jour le rappel administratif");

const updateNonoNotes = async (notes: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/notes", { notes }, "Impossible de mettre a jour les notes de Nono");

const addBottleEntry = async (amountMl: number, timestamp: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/bottles", { amountMl, timestamp }, "Impossible d'ajouter le biberon");

const addWeightEntry = async (date: string, weightKg: number): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/weights", { date, weightKg }, "Impossible d'ajouter la pesee");

const deleteBottleEntry = async (entryId: string): Promise<ApiResponse> =>
  deleteNonoEntry(`/api/nono/bottles/${entryId}`, "Impossible de supprimer le biberon");

const deleteWeightEntry = async (entryId: string): Promise<ApiResponse> =>
  deleteNonoEntry(`/api/nono/weights/${entryId}`, "Impossible de supprimer la pesee");

export {
  addBottleEntry,
  addWeightEntry,
  deleteBottleEntry,
  deleteWeightEntry,
  getNonoData,
  updateAdministrativeReminder,
  updateBirthDate,
  updateCheckupDate,
  updateCheckupReminder,
  updateNonoNotes,
  updateVaccineDate,
  updateVaccineReminder,
  updateVitaminReminder,
};
