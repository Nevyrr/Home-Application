import { ReminderPost } from "../types/index.ts";
import { fetchWithAuth } from "../utils/authClient.ts";

export interface ReminderPostPayload {
  title: string;
  body: string;
  status: "todo" | "doing" | "done";
  dueDate?: string;
  sortOrder?: number;
}

interface ApiResponse {
  posts?: ReminderPost[];
  success?: string;
  error?: string;
  post?: ReminderPost;
}

/**************************** Get all reminder-posts  ********************************/
const getPosts = async (): Promise<{ posts: ReminderPost[] }> => {
  const res = await fetchWithAuth("/api/reminder-posts");
  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch posts");
  }

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

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create post");
  }

  return {
    success: data.message || data.success,
    post: data.data?.post || data.post,
    ...data,
  };
};

/**************************** Delete reminder-posts  ******************************/
const deletePost = async (_id: string): Promise<ApiResponse> => {
  const res = await fetchWithAuth(`/api/reminder-posts/${_id}`, {
    method: "DELETE",
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete post");
  }

  return {
    success: data.message || data.success,
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

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update post");
  }

  return {
    success: data.message || data.success,
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

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to reorder posts");
  }

  return {
    success: data.message || data.success,
    ...data,
  };
};

export { getPosts, createPost, deletePost, updatePost, reorderPosts };
