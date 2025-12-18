import { ShoppingDay } from "../types/index.ts";

interface ApiResponse {
  posts?: ShoppingDay[];
  success?: string;
  error?: string;
}

/**************************** Get all shopping-posts  ********************************/
const getPosts = async (): Promise<{ posts: ShoppingDay[] }> => {
  const res = await fetch("/api/shopping-posts");
  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch posts");
  }

  return data as { posts: ShoppingDay[] };
};

/**************************** Create shopping-date  ******************************/
const createDate = async (date: string, name: string): Promise<ApiResponse> => {
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

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create date");
  }

  return data;
};

/**************************** Update shopping-date  ******************************/
const updateDateItem = async (shoppingListId: string, name: string, date: string): Promise<ApiResponse> => {
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

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update date");
  }

  return data;
};


/**************************** Create shopping-posts  ******************************/
const createPost = async (shoppingListId: string, title: string, count: number, unit: string, priorityColor: number): Promise<ApiResponse> => {
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

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create post");
  }

  return data;
};

/**************************** Delete shopping-posts  ******************************/
const deletePost = async (_id: string): Promise<ApiResponse> => {
  const res = await fetch(`/api/shopping-posts/${_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete post");
  }

  return data;
};

/**************************** Delete all shopping-posts  ******************************/
const deletePosts = async (shoppingListId: string): Promise<ApiResponse> => {
  const res = await fetch(`/api/shopping-posts/list/${shoppingListId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete posts");
  }

  return data;
};

/**************************** Update shopping-posts  ******************************/
const updatePost = async (_id: string, title: string, count: number, unit: string, priorityColor: number): Promise<ApiResponse> => {
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

  const data: ApiResponse = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update post");
  }

  return data;
};

export { getPosts, createDate, updateDateItem, createPost, deletePost, deletePosts, updatePost };

