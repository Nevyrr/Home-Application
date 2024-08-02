/**************************** Get all shopping-posts  ********************************/
const getPosts = async () => {
  const res = await fetch("/api/shopping-posts");
  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Create shopping-posts  ******************************/
const createPost = async (title, count, priorityColor) => {
  if (!title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/shopping-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, count, priorityColor }),
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

/**************************** Delete all shopping-posts  ******************************/
const deletePosts = async () => {
  const res = await fetch(`/api/shopping-posts/`, {
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
const updatePost = async (_id, title, count, priorityColor) => {
  if (!title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch(`/api/shopping-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, count, priorityColor }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getPosts, createPost, deletePost, deletePosts, updatePost };
