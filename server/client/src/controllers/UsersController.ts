import { fetchWithAuth } from "../utils/authClient.ts";
import { storeSession } from "../utils/session.ts";

interface LoginResponse {
  token: string;
  refreshToken?: string;
  name: string;
  email: string;
  receiveEmail: boolean;
  isAdmin: boolean;
  data?: {
    user?: {
      id: string;
      name: string;
      email: string;
      receiveEmail: boolean;
      isAdmin: boolean;
    };
    tokens?: {
      accessToken: string;
      refreshToken: string;
    };
  };
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  receiveEmail?: boolean;
}

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

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  storeSession(data);
  return data;
};

/**************************** Update User  ********************************/
const updateUser = async (user: UpdateUserData): Promise<void> => {
  const userId = localStorage.getItem("id");
  const res = await fetchWithAuth("/api/users/" + userId, {
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

  if (res.ok) {
    if (user.name !== undefined) {
      localStorage.setItem("name", user.name);
    }
    if (user.email !== undefined) {
      localStorage.setItem("email", user.email);
    }
    if (user.receiveEmail !== undefined) {
      localStorage.setItem("receiveEmail", String(user.receiveEmail));
    }
  } else {
    throw Error("Could not update user");
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

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  storeSession(data);
  return data;
};

const logoutUser = async (): Promise<void> => {
  const token = localStorage.getItem("token");

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

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Connexion Google impossible");
  }

  storeSession(data);
  return data;
};

export { loginUser, registerUser, updateUser, logoutUser, loginWithGoogle };
