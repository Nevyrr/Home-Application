/**************************** Get all shopping-posts  ********************************/
const getPosts = async () => {
  const res = await fetch("/api/shopping-posts");
  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Create shopping-date  ******************************/
const createDate = async (date, name) => {
  if (!date || !name) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/shopping-posts/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ date, name }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

/**************************** Update shopping-date  ******************************/
const updateDateItem = async (shoppingListId, name, date) => {
  if (!date || !shoppingListId) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/shopping-posts/date", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ shoppingListId, name, date }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};


/**************************** Create shopping-posts  ******************************/
const createPost = async (shoppingListId, title, count, unit, priorityColor) => {
  if (!shoppingListId || !title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch("/api/shopping-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ shoppingListId, title, count, unit, priorityColor }),
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
const deletePosts = async (shoppingListId) => {
  const res = await fetch(`/api/shopping-posts/list/${shoppingListId}`, {
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
const updatePost = async (_id, title, count, unit, priorityColor) => {
  if (!title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetch(`/api/shopping-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({ title, count, unit, priorityColor }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw Error(data.error);
  }

  return data;
};

export { getPosts, createDate, updateDateItem, createPost, deletePost, deletePosts, updatePost };
