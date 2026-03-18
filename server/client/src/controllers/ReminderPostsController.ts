import { ReminderPost } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";
import { ApiEnvelope, getApiMessage, readApiResponse } from "../utils/api.ts";

export interface ReminderPostPayload {
  title: string;
  body: string;
  status: "todo" | "doing" | "done";
  dueDate?: string;
  sortOrder?: number;
}

interface ApiResponse extends ApiEnvelope<{ posts?: ReminderPost[]; post?: ReminderPost }> {
  posts?: ReminderPost[];
  success?: string;
  error?: string;
  post?: ReminderPost;
}

/**************************** Get all reminder-posts  ********************************/
const getPosts = async (): Promise<{ posts: ReminderPost[] }> => {
  const res = await fetchWithAuth("/api/reminder-posts");
  const data = await readApiResponse<ApiResponse>(res, "Failed to fetch posts");

  const posts = data.data?.posts || data.posts || [];
  return { posts };
};

/**************************** Create reminder-posts  ******************************/
const createPost = async (payload: ReminderPostPayload): Promise<ApiResponse> => {
  if (!payload.title) {
    throw Error("Les champs obligatoires sont manquants");
  }

  const res = await fetchWithAuth("/api/reminder-posts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to create post");

  return {
    success: getApiMessage(data),
    post: data.data?.post || data.post,
    ...data,
  };
};

/**************************** Delete reminder-posts  ******************************/
const deletePost = async (_id: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/reminder-posts/${_id}`, {
    method: "DELETE",
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to delete post");

  return {
    success: getApiMessage(data),
    ...data,
  };
};

/**************************** Update reminder-posts  ******************************/
const updatePost = async (_id: string, payload: ReminderPostPayload): Promise<ApiResponse> => {
  if (!payload.title) {
    throw Error("Les champs obligatoires sont manquants");
  }

  const res = await fetchWithAuth(`/api/reminder-posts/${_id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to update post");

  return {
    success: getApiMessage(data),
    post: data.data?.post || data.post,
    ...data,
  };
};

const reorderPosts = async (orderedIds: string[]): Promise<ApiResponse> => {
  const res = await fetchWithAuth("/api/reminder-posts/reorder", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ orderedIds }),
  });

  const data = await readApiResponse<ApiResponse>(res, "Failed to reorder posts");

  return {
    success: getApiMessage(data),
    ...data,
  };
};

export { getPosts, createPost, deletePost, updatePost, reorderPosts };
