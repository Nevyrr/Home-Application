import { jwtDecode } from "jwt-decode";

/**************************** Login User  **********************************/
const loginUser = async (email, password) => {
  if (!email || !password) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({email, password }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }
 
  localStorage.setItem("token", data.token);
  localStorage.setItem("id",  (jwtDecode(data.token))._id);
  localStorage.setItem("name", data.name);
  localStorage.setItem("email", data.email);

  return data;
};

/**************************** Register User  ********************************/
const registerUser = async (name, email, password, passwordConfirm) => {
  if (!name || !email || !password || !passwordConfirm) {
    throw Error("All fields are required");
  }

  if (password !== passwordConfirm) {
    throw Error("Passwords do not match");
  }

  const res = await fetch('/api/users', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw Error(data.error);
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("id",  (jwtDecode(data.token))._id);
  localStorage.setItem("token", data.name);
  localStorage.setItem("email", data.email);

  return data;
};

export { loginUser, registerUser };
