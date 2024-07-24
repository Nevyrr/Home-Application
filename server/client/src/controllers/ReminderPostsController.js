/**************************** Get all reminder-posts  ********************************/
const getPosts = async () => {
  const res = await fetch("/api/reminder-posts");
  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Get user reminder-posts  ******************************/
const getUserPosts = async () => {
  const res = await fetch("/api/reminder-posts/user", {
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

/**************************** Create reminder-posts  ******************************/
const createPost = async (title, body, priorityColor) => {
  if (!title || !body || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/reminder-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, body, priorityColor }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Delete reminder-posts  ******************************/
const deletePost = async (_id) => {
  const res = await fetch(`/api/reminder-posts/${_id}`, {
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

/**************************** Update reminder-posts  ******************************/
const updatePost = async (_id, title, body, priorityColor) => {
  if (!title || !body || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch(`/api/reminder-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, body, priorityColor }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getPosts, getUserPosts, createPost, deletePost, updatePost };
