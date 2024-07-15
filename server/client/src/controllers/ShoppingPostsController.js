/**************************** Get all shopping-posts  ********************************/
const getPosts = async () => {
  const res = await fetch("/api/shopping-posts");
  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Get user shopping-posts  ******************************/
const getUserPosts = async () => {
  const res = await fetch("/api/shopping-posts/user", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Create shopping-posts  ******************************/
const createPost = async (title, body) => {
  if (!title || !body) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/shopping-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, body }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Delete shopping-posts  ******************************/
const deletePost = async (_id) => {
  const res = await fetch(`/api/shopping-posts/${_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Update shopping-posts  ******************************/
const updatePost = async (_id, title, body) => {
  if (!title || !body) {
    throw Error("All fields are required");
  }

  const res = await fetch(`/api/shopping-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, body }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getPosts, getUserPosts, createPost, deletePost, updatePost };
