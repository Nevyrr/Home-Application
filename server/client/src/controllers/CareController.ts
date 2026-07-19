import { Nono, Taco } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

type CareProfiles = { taco: Taco; nono: Nono };

export const updateCare = async <P extends keyof CareProfiles>(
  profile: P,
  care: string,
  intervalMonths: number,
  date?: string
): Promise<{ record: CareProfiles[P]; message: string }> => {
  const response = await fetchWithAuth(`/api/${profile}/care/${care}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ intervalMonths, date }),
  });
  const data = await readApiResponse<ApiEnvelope<Partial<{ [K in P]: CareProfiles[K][] }>>>(
    response, "Impossible d'enregistrer le soin"
  );
  const record = data.data?.[profile]?.[0];
  if (!record) throw new Error("Réponse du soin incomplète");
  return { record, message: getApiMessage(data) || "Soin enregistré" };
};
