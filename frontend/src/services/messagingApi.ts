// services/messagingApi.ts
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Helper function to get authentication headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const getAuthHeadersMultipart = (): Record<string, string> => {
  const token = localStorage.getItem('token') || localStorage.getItem('access_token');
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
      if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    } catch (parseError) {
      console.log('Could not parse error response as JSON');
      try {
        const textError = await response.text();
        errorMessage = textError || errorMessage;
      } catch {
        // Use default error message
      }
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
  first_name: string;
  last_name: string;
  display_name: string;
  profile_photo?: string;
}

export interface MessageReaction {
  id: string;
  user: User;
  emoji: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation: string;
  sender: User;
  content?: string;
  message_type: 'text' | 'image' | 'file' | 'emoji';
  file_attachment?: string;
  image_attachment?: string;
  file_url?: string;
  image_url?: string;
  reply_to?: {
    id: string;
    sender: string;
    content: string;
    message_type: string;
  };
  reactions: MessageReaction[];
  is_active: boolean;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participants: User[];
  is_group: boolean;
  group_name?: string;
  group_image?: string;
  group_image_url?: string;
  last_message?: Message;
  unread_count: number;
  other_participant?: User;
  created_at: string;
  updated_at: string;
}

export interface CreateConversationInput {
  is_group: boolean;
  group_name?: string;
  group_image?: File;
  participant_ids: number[];
}

export interface CreateMessageInput {
  conversation: string;
  content?: string;
  message_type?: 'text' | 'image' | 'file' | 'emoji';
  file_attachment?: File;
  image_attachment?: File;
  reply_to?: string;
}

export interface MessageSearchParams {
  q?: string;
  conversation_id?: string;
  page?: number;
}

export interface ConversationListParams {
  page?: number;
  search?: string;
}

// ========== API FUNCTIONS ==========

export const messagingApi = {
  // ========== CONVERSATION OPERATIONS ==========
  
  getConversations: async (params?: ConversationListParams): Promise<Conversation[]> => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, value.toString());
        }
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    const results = data.results || data;
    return Array.isArray(results) ? results : [];
  },

  getConversationById: async (id: string): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/${id}/`, {
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  createConversation: async (data: CreateConversationInput): Promise<Conversation> => {
    const formData = new FormData();
    formData.append('is_group', data.is_group.toString());
    
    if (data.group_name) {
      formData.append('group_name', data.group_name);
    }
    
    if (data.group_image) {
      formData.append('group_image', data.group_image);
    }
    
    data.participant_ids.forEach(id => {
      formData.append('participant_ids', id.toString());
    });
    
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  startConversation: async (participantId: number): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/start_conversation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participant_id: participantId }),
    });
    
    return handleResponse(response);
  },

  addParticipants: async (conversationId: string, participantIds: number[]): Promise<Conversation> => {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationId}/add_participants/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ participant_ids: participantIds }),
    });
    
    return handleResponse(response);
  },

  leaveConversation: async (conversationId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationId}/leave_conversation/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  // ========== MESSAGE OPERATIONS ==========

  getConversationMessages: async (conversationId: string, page?: number): Promise<{results: Message[], next?: string, previous?: string}> => {
    const searchParams = new URLSearchParams();
    if (page) {
      searchParams.append('page', page.toString());
    }
    
    const response = await fetch(`${API_BASE_URL}/messaging/conversations/${conversationId}/messages/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return {
      results: data.results || data,
      next: data.next,
      previous: data.previous
    };
  },

  sendMessage: async (data: CreateMessageInput): Promise<Message> => {
    const formData = new FormData();
    formData.append('conversation', data.conversation);
    
    if (data.content) {
      formData.append('content', data.content);
    }
    
    if (data.message_type) {
      formData.append('message_type', data.message_type);
    }
    
    if (data.file_attachment) {
      formData.append('file_attachment', data.file_attachment);
    }
    
    if (data.image_attachment) {
      formData.append('image_attachment', data.image_attachment);
    }
    
    if (data.reply_to) {
      formData.append('reply_to', data.reply_to);
    }
    
    const response = await fetch(`${API_BASE_URL}/messaging/messages/`, {
      method: 'POST',
      headers: getAuthHeadersMultipart(),
      body: formData,
    });
    
    return handleResponse(response);
  },

  editMessage: async (messageId: string, content: string): Promise<Message> => {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/edit/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content }),
    });
    
    return handleResponse(response);
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/soft_delete/`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  markAsRead: async (messageId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/mark_as_read/`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    
    return handleResponse(response);
  },

  reactToMessage: async (messageId: string, emoji: string): Promise<MessageReaction> => {
    const response = await fetch(`${API_BASE_URL}/messaging/messages/${messageId}/react/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ emoji }),
    });
    
    return handleResponse(response);
  },

  searchMessages: async (params: MessageSearchParams): Promise<{results: Message[], next?: string, previous?: string}> => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/messaging/messages/search/?${searchParams.toString()}`, {
      headers: getAuthHeaders(),
    });
    
    const data = await handleResponse(response);
    return {
      results: data.results || data,
      next: data.next,
      previous: data.previous
    };
  },
};

// Export individual functions for convenience
export const {
  getConversations,
  getConversationById,
  createConversation,
  startConversation,
  addParticipants,
  leaveConversation,
  getConversationMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markAsRead,
  reactToMessage,
  searchMessages,
} = messagingApi;