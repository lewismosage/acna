const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersWithoutContentType = (): Record<string, string> => {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorData.detail || errorMessage;
    } catch {
      // If we can't parse the error, use the default message
    }
    throw new Error(errorMessage);
  }
  
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

// ========== INTERFACES ==========

export interface User {
  id: number;
  username: string;
  display_name: string;
  first_name: string;
  last_name: string;
}

export interface ForumCategory {
  id: number;
  title: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  order: number;
  thread_count: number;
  post_count: number;
  last_post?: {
    id: number;
    author: string;
    created_at: string;
    thread_title: string;
    thread_id: number;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface ForumPost {
  id: number;
  content: string;
  author: User;
  parent_post?: number | null;
  like_count: number;
  reply_count: number;
  is_liked: boolean;
  is_active: boolean;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  replies: ForumPost[];
}

export interface ForumThread {
  id: number;
  title: string;
  slug: string;
  content: string;
  author: User;
  category: ForumCategory;
  is_pinned: boolean;
  is_locked: boolean;
  is_active: boolean;
  view_count: number;
  like_count: number;
  reply_count: number;
  last_post?: {
    id: number;
    author: string;
    created_at: string;
    content_preview: string;
  } | null;
  has_new_replies: boolean;
  is_liked: boolean;
  is_subscribed: boolean;
  tags: string[];
  recent_posts: ForumPost[];
  created_at: string;
  updated_at: string;
  last_activity: string;
  forum_posts?: ForumPost[]; // Available in detailed view
}

export interface CreateForumCategoryInput {
  title: string;
  description: string;
  icon?: string;
  color?: string;
  order?: number;
}

export interface CreateForumThreadInput {
  title: string;
  content: string;
  category_id: number;
  tags?: string[];
}

export interface CreateForumPostInput {
  content: string;
  thread: number;
  parent_post?: number | null;
}

export interface ForumAnalytics {
  total_categories: number;
  total_threads: number;
  total_posts: number;
  active_threads: number;
  pinned_threads: number;
  total_views: number;
  total_likes: number;
  recent_activity_count: number;
  threads_by_category: { [key: string]: number };
  top_threads: Array<{
    id: number;
    title: string;
    author__username: string;
    category__title: string;
    view_count: number;
    like_count: number;
    reply_count: number;
  }>;
  active_users: number;
}

export interface ForumSearchParams {
  query?: string;
  category?: string;
  author?: string;
  tags?: string[];
  date_from?: string;
  date_to?: string;
  sort_by?: 'recent' | 'popular' | 'replies' | 'views';
}

export interface UserForumStats {
  threads_created: number;
  posts_created: number;
  total_thread_views: number;
  total_thread_likes: number;
  total_post_likes: number;
  subscribed_threads: number;
}

// ========== NORMALIZATION FUNCTIONS ==========

const normalizeUser = (backendUser: any): User => ({
  id: backendUser.id || 0,
  username: backendUser.username || '',
  display_name: backendUser.display_name || backendUser.username || '',
  first_name: backendUser.first_name || '',
  last_name: backendUser.last_name || '',
});

const normalizeForumCategory = (backendCategory: any): ForumCategory => ({
  id: backendCategory.id || 0,
  title: backendCategory.title || '',
  slug: backendCategory.slug || '',
  description: backendCategory.description || '',
  icon: backendCategory.icon || 'MessageSquare',
  color: backendCategory.color || 'blue',
  is_active: backendCategory.is_active || false,
  order: backendCategory.order || 0,
  thread_count: backendCategory.thread_count || 0,
  post_count: backendCategory.post_count || 0,
  last_post: backendCategory.last_post || null,
  created_at: backendCategory.created_at || '',
  updated_at: backendCategory.updated_at || '',
});

const normalizeForumPost = (backendPost: any): ForumPost => ({
  id: backendPost.id || 0,
  content: backendPost.content || '',
  author: normalizeUser(backendPost.author || {}),
  parent_post: backendPost.parent_post || null,
  like_count: backendPost.like_count || 0,
  reply_count: backendPost.reply_count || 0,
  is_liked: backendPost.is_liked || false,
  is_active: backendPost.is_active || true,
  is_edited: backendPost.is_edited || false,
  created_at: backendPost.created_at || '',
  updated_at: backendPost.updated_at || '',
  replies: Array.isArray(backendPost.replies) 
    ? backendPost.replies.map(normalizeForumPost)
    : [],
});

const normalizeForumThread = (backendThread: any): ForumThread => ({
  id: backendThread.id || 0,
  title: backendThread.title || '',
  slug: backendThread.slug || '',
  content: backendThread.content || '',
  author: normalizeUser(backendThread.author || {}),
  category: normalizeForumCategory(backendThread.category || {}),
  is_pinned: backendThread.is_pinned || false,
  is_locked: backendThread.is_locked || false,
  is_active: backendThread.is_active || true,
  view_count: backendThread.view_count || 0,
  like_count: backendThread.like_count || 0,
  reply_count: backendThread.reply_count || 0,
  last_post: backendThread.last_post || null,
  has_new_replies: backendThread.has_new_replies || false,
  is_liked: backendThread.is_liked || false,
  is_subscribed: backendThread.is_subscribed || false,
  tags: Array.isArray(backendThread.tags) ? backendThread.tags : [],
  recent_posts: Array.isArray(backendThread.recent_posts) 
    ? backendThread.recent_posts.map(normalizeForumPost)
    : [],
  created_at: backendThread.created_at || '',
  updated_at: backendThread.updated_at || '',
  last_activity: backendThread.last_activity || '',
  forum_posts: Array.isArray(backendThread.forum_posts)
    ? backendThread.forum_posts.map(normalizeForumPost)
    : undefined,
});

// ========== API FUNCTIONS ==========

export const forumApi = {
  // ========== CATEGORY OPERATIONS ==========
  
  getCategories: async (params?: {
    search?: string;
    ordering?: string;
  }): Promise<ForumCategory[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/forum/categories/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeForumCategory) : [];
  },

  getCategoryById: async (id: number): Promise<ForumCategory> => {
    const response = await fetch(`${API_BASE_URL}/forum/categories/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeForumCategory(data);
  },

  createCategory: async (data: CreateForumCategoryInput): Promise<ForumCategory> => {
    const response = await fetch(`${API_BASE_URL}/forum/categories/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumCategory(result);
  },

  updateCategory: async (id: number, data: Partial<CreateForumCategoryInput>): Promise<ForumCategory> => {
    const response = await fetch(`${API_BASE_URL}/forum/categories/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumCategory(result);
  },

  deleteCategory: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/forum/categories/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  getPopularCategories: async (): Promise<ForumCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/categories/popular/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeForumCategory) : [];
  },

  getCategoryThreads: async (categoryId: number, params?: {
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<ForumThread[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/forum/categories/${categoryId}/threads/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumThread) : [];
  },

  // ========== THREAD OPERATIONS ==========
  
  getThreads: async (params?: {
    category?: number;
    is_pinned?: boolean;
    is_locked?: boolean;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<ForumThread[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/forum/threads/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumThread) : [];
  },

  getThreadById: async (id: number): Promise<ForumThread> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeForumThread(data);
  },

  createThread: async (data: CreateForumThreadInput): Promise<ForumThread> => {
    console.log('Sending thread data:', data);
    const response = await fetch(`${API_BASE_URL}/forum/threads/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumThread(result);
  },

  updateThread: async (id: number, data: Partial<CreateForumThreadInput>): Promise<ForumThread> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumThread(result);
  },

  deleteThread: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  getRecentThreads: async (): Promise<ForumThread[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/recent/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeForumThread) : [];
  },

  getPopularThreads: async (): Promise<ForumThread[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/popular/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return Array.isArray(data) ? data.map(normalizeForumThread) : [];
  },

  getMyThreads: async (): Promise<ForumThread[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/my_threads/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumThread) : [];
  },

  likeThread: async (id: number): Promise<{ liked: boolean; like_count: number }> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/like/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  subscribeToThread: async (id: number): Promise<{ subscribed: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/subscribe/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  toggleThreadPin: async (id: number): Promise<{ pinned: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/toggle_pin/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  toggleThreadLock: async (id: number): Promise<{ locked: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/forum/threads/${id}/toggle_lock/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== POST OPERATIONS ==========
  
  getPosts: async (params?: {
    thread?: number;
    author?: number;
    parent_post?: number;
    search?: string;
    ordering?: string;
    page?: number;
  }): Promise<ForumPost[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/forum/posts/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumPost) : [];
  },

  getPostById: async (id: number): Promise<ForumPost> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return normalizeForumPost(data);
  },

  createPost: async (data: CreateForumPostInput): Promise<ForumPost> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumPost(result);
  },

  updatePost: async (id: number, data: Partial<CreateForumPostInput>): Promise<ForumPost> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    
    const result = await handleResponse(response);
    return normalizeForumPost(result);
  },

  deletePost: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeadersWithoutContentType(),
    });
    
    return handleResponse(response);
  },

  getMyPosts: async (): Promise<ForumPost[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/my_posts/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumPost) : [];
  },

  likePost: async (id: number): Promise<{ liked: boolean; like_count: number }> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/like/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  getPostReplies: async (id: number): Promise<ForumPost[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/posts/${id}/replies/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumPost) : [];
  },

  // ========== ANALYTICS OPERATIONS ==========
  
  getForumAnalytics: async (): Promise<ForumAnalytics> => {
    const response = await fetch(`${API_BASE_URL}/forum/analytics/dashboard/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return {
      total_categories: data.total_categories || 0,
      total_threads: data.total_threads || 0,
      total_posts: data.total_posts || 0,
      active_threads: data.active_threads || 0,
      pinned_threads: data.pinned_threads || 0,
      total_views: data.total_views || 0,
      total_likes: data.total_likes || 0,
      recent_activity_count: data.recent_activity_count || 0,
      threads_by_category: data.threads_by_category || {},
      top_threads: data.top_threads || [],
      active_users: data.active_users || 0,
    };
  },

  getUserForumStats: async (): Promise<UserForumStats> => {
    const response = await fetch(`${API_BASE_URL}/forum/analytics/user_stats/`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return {
      threads_created: data.threads_created || 0,
      posts_created: data.posts_created || 0,
      total_thread_views: data.total_thread_views || 0,
      total_thread_likes: data.total_thread_likes || 0,
      total_post_likes: data.total_post_likes || 0,
      subscribed_threads: data.subscribed_threads || 0,
    };
  },

  // ========== SEARCH OPERATIONS ==========
  
  searchForum: async (searchParams: ForumSearchParams): Promise<ForumThread[]> => {
    const response = await fetch(`${API_BASE_URL}/forum/search/search/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(searchParams),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results.map(normalizeForumThread) : [];
  },
};

// Export individual functions for convenience
export const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getPopularCategories,
  getCategoryThreads,
  getThreads,
  getThreadById,
  createThread,
  updateThread,
  deleteThread,
  getRecentThreads,
  getPopularThreads,
  getMyThreads,
  likeThread,
  subscribeToThread,
  toggleThreadPin,
  toggleThreadLock,
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  likePost,
  getPostReplies,
  getForumAnalytics,
  getUserForumStats,
  searchForum,
} = forumApi;