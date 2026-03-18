import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, readApiResponse } from "../utils/api.ts";
import { getAccessToken, loadStoredUser, SessionResponse, storeSession, updateStoredUser } from "../utils/session.ts";
import { ManagedUser, UserAccessLevel, UserRole } from "../types/index.ts";

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  receiveEmail?: boolean;
}

interface MessageResponse extends ApiEnvelope {
  message?: string;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  receiveEmail: boolean;
  isAdmin: boolean;
  accessLevel: UserAccessLevel;
  role: UserRole;
}

type LoginResponse = SessionResponse &
  ApiEnvelope<{
    user?: SessionUser;
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  }>;

type UpdateUserResponse = ApiEnvelope<{ user?: SessionUser }> & {
  user?: SessionUser;
};

type ListUsersResponse = ApiEnvelope<{ users?: ManagedUser[] }> & {
  users?: ManagedUser[];
};

/**************************** Login User  **********************************/
const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  if (!email || !password) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await readApiResponse<LoginResponse>(res, "Connexion impossible");

  storeSession(data);
  return data;
};

/**************************** Update User  ********************************/
const updateUser = async (user: UpdateUserData): Promise<void> => {
  const userId = loadStoredUser().id;

  if (!userId) {
    throw Error("Utilisateur introuvable");
  }

  const res = await fetchWithAuth(`/api/users/${userId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: user.password,
      receiveEmail: user.receiveEmail,
    }),
  });

  const data = await readApiResponse<UpdateUserResponse>(res, "Could not update user");
  const updatedUser = data.data?.user || data.user;

  if (updatedUser) {
    updateStoredUser(updatedUser);
  }
};

/**************************** Register User  ********************************/
const registerUser = async (
  name: string,
  email: string,
  password: string,
  passwordConfirm: string
): Promise<LoginResponse> => {
  if (!name || !email || !password || !passwordConfirm) {
    throw Error("All fields are required");
  }

  if (password !== passwordConfirm) {
    throw Error("Passwords do not match");
  }

  const res = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await readApiResponse<LoginResponse>(res, "Inscription impossible");

  storeSession(data);
  return data;
};

const logoutUser = async (): Promise<void> => {
  const token = getAccessToken();

  if (!token) {
    return;
  }

  await fetchWithAuth("/api/users/logout", {
    method: "POST",
  });
};

const loginWithGoogle = async (credential: string): Promise<LoginResponse> => {
  const res = await fetch("/api/users/google", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ credential }),
  });

  const data = await readApiResponse<LoginResponse>(res, "Connexion Google impossible");

  storeSession(data);
  return data;
};

const requestPasswordReset = async (email: string): Promise<void> => {
  const res = await fetch("/api/users/forgot-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  await readApiResponse<MessageResponse>(res, "Impossible d'envoyer le lien de reinitialisation");
};

const resetPassword = async (token: string, password: string): Promise<void> => {
  const res = await fetch("/api/users/reset-password", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token, password }),
  });

  await readApiResponse<MessageResponse>(res, "Impossible de reinitialiser le mot de passe");
};

const listUsers = async (): Promise<ManagedUser[]> => {
  const res = await fetchWithAuth("/api/users", {
    method: "GET",
  });

  const data = await readApiResponse<ListUsersResponse>(res, "Impossible de charger les utilisateurs");
  return data.data?.users || data.users || [];
};

const updateUserAccess = async (userId: string, role: UserRole): Promise<ManagedUser | null> => {
  const res = await fetchWithAuth(`/api/users/${userId}/access`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });

  const data = await readApiResponse<ApiEnvelope<{ user?: ManagedUser }> & { user?: ManagedUser }>(
    res,
    "Impossible de mettre a jour le niveau d'acces"
  );

  return data.data?.user || data.user || null;
};

const deleteUserAccount = async (userId: string): Promise<void> => {
  const res = await fetchWithAuth(`/api/users/${userId}`, {
    method: "DELETE",
  });

  await readApiResponse<ApiEnvelope>(res, "Impossible de supprimer le compte");
};

export {
  loginUser,
  registerUser,
  updateUser,
  logoutUser,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
  listUsers,
  updateUserAccess,
  deleteUserAccount,
};
