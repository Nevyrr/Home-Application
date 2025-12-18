import { ReminderPost } from "../types/index.ts";

interface ApiResponse {
  posts?: ReminderPost[];
  success?: string;
  error?: string;
  post?: ReminderPost;
}

/**************************** Get all reminder-posts  ********************************/
const getPosts = async (): Promise<{ posts: ReminderPost[] }> => {
  const res = await fetch("/api/reminder-posts");
  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to fetch posts");
  }

  // Gérer le nouveau format de réponse (data.data.posts) ou l'ancien (data.posts)
  const posts = data.data?.posts || data.posts || [];
  return { posts };
};

/**************************** Create reminder-posts  ******************************/
const createPost = async (title: string, body: string, priorityColor: number): Promise<ApiResponse> => {
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

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to create post");
  }

  // Gérer le nouveau format de réponse
  return {
    success: data.message || data.success,
    post: data.data?.post || data.post,
    ...data
  };
};

/**************************** Delete reminder-posts  ******************************/
const deletePost = async (_id: string): Promise<ApiResponse> => {
  const res = await fetch(`/api/reminder-posts/${_id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to delete post");
  }

  // Gérer le nouveau format de réponse
  return {
    success: data.message || data.success,
    ...data
  };
};

/**************************** Update reminder-posts  ******************************/
const updatePost = async (_id: string, title: string, body: string, priorityColor: number): Promise<ApiResponse> => {
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

  const data: any = await res.json();

  if (!res.ok) {
    throw Error(data.error || "Failed to update post");
  }

  // Gérer le nouveau format de réponse
  return {
    success: data.message || data.success,
    post: data.data?.post || data.post,
    ...data
  };
};

export { getPosts, createPost, deletePost, updatePost };

