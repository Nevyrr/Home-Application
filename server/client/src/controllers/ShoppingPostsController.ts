import { ShoppingDay } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

interface ApiResponse extends ApiEnvelope<{ posts?: ShoppingDay[] }> {
  posts?: ShoppingDay[];
  success?: string;
  error?: string;
}

/**************************** Get all shopping-posts  ********************************/
const getPosts = async (): Promise<{ posts: ShoppingDay[] }> => {
  const res = await fetchWithAuth("/api/shopping-posts");
  const data = await readApiResponse<ApiResponse>(res, "Failed to fetch posts");

  return {
    posts: data.data?.posts || data.posts || [],
  };
};

/**************************** Create shopping-date  ******************************/
const createDate = async (date: string, name: string): Promise<ApiResponse> => {
  if (!date || !name) {
    throw Error("All fields are required");
  }

  const res = await fetchWithAuth("/api/shopping-posts/date", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, name }),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to create date");
  return { ...data, success: getApiMessage(data) };
};

/**************************** Update shopping-date  ******************************/
const updateDateItem = async (shoppingListId: string, name: string, date: string): Promise<ApiResponse> => {
  if (!date || !shoppingListId) {
    throw Error("All fields are required");
  }

  const res = await fetchWithAuth("/api/shopping-posts/date", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shoppingListId, name, date }),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to update date");
  return { ...data, success: getApiMessage(data) };
};

/**************************** Create shopping-posts  ******************************/
const createPost = async (
  shoppingListId: string,
  title: string,
  count: number,
  unit: string,
  priorityColor: number
): Promise<ApiResponse> => {
  if (!shoppingListId || !title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetchWithAuth("/api/shopping-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ shoppingListId, title, count, unit, priorityColor }),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to create post");
  return { ...data, success: getApiMessage(data) };
};

/**************************** Delete shopping-posts  ******************************/
const deletePost = async (_id: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/shopping-posts/${_id}`, {
    method: "DELETE",
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to delete post");
  return { ...data, success: getApiMessage(data) };
};

/**************************** Delete all shopping-posts  ******************************/
const deletePosts = async (shoppingListId: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/shopping-posts/list/${shoppingListId}`, {
    method: "DELETE",
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to delete posts");
  return { ...data, success: getApiMessage(data) };
};

/**************************** Update shopping-posts  ******************************/
const updatePost = async (
  _id: string,
  title: string,
  count: number,
  unit: string,
  priorityColor: number
): Promise<ApiResponse> => {
  if (!title || !count || priorityColor === undefined) {
    throw Error("All fields are required");
  }

  const res = await fetchWithAuth(`/api/shopping-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, count, unit, priorityColor }),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to update post");
  return { ...data, success: getApiMessage(data) };
};

export { getPosts, createDate, updateDateItem, createPost, deletePost, deletePosts, updatePost };
