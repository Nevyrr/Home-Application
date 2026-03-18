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
  payload: Record<string, string>,
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

const getNonoData = async (): Promise<Nono> => {
  const res = await fetchWithAuth("/api/nono/", {
    method: "GET",
    headers: jsonHeaders,
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to fetch nono data");
  const nonoArray = data.data?.nono || data.nono || [];

  return Array.isArray(nonoArray) && nonoArray.length > 0 ? { ...emptyNonoData, ...nonoArray[0] } : emptyNonoData;
};

const updateBirthDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/birth/date", { date }, "Failed to update birth date");

const updateCheckupDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/checkup/date", { date }, "Failed to update checkup date");

const updateCheckupReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/checkup/reminder", { date }, "Failed to update checkup reminder");

const updateVaccineDate = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vaccine/date", { date }, "Failed to update vaccine date");

const updateVaccineReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vaccine/reminder", { date }, "Failed to update vaccine reminder");

const updateVitaminReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/vitamin/reminder", { date }, "Failed to update vitamin reminder");

const updateAdministrativeReminder = async (date: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/administrative/reminder", { date }, "Failed to update administrative reminder");

const updateNonoNotes = async (notes: string): Promise<ApiResponse> =>
  postNonoUpdate("/api/nono/notes", { notes }, "Failed to update nono notes");

export {
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
