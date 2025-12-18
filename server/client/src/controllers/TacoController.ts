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

  const data: { taco: Taco[] } = await res.json();

  if (!res.ok) {
    throw Error("Failed to fetch taco data");
  }

  return data.taco[0];
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
  if (!selectedFile) {
    throw Error("Please select a file first");
  }
  const formData = new FormData();
  formData.append("image", selectedFile);
  const res = await fetch("/api/taco/upload/", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: formData,
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to upload file");
  }

  return data;
};

export { getTacoData, getFile, updateVermifugeDate, updateVermifugeReminder, updateAntiPuceDate, updateAntiPuceReminder, uploadFile };

