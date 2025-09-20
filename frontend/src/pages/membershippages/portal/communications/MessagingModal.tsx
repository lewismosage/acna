import { useState, useEffect, useRef } from 'react';
import { 
  X, Send, Paperclip, Image, Smile, Reply, Edit, Trash2, 
} from 'lucide-react';
import { messagingApi, type Conversation, type Message, type CreateMessageInput } from '../../../../services/messagingApi';
import defaultProfileImage from '../../../../assets/default Profile Image.png';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  mobile_number: string;
  country: string;
  county?: string;
  membership_class: string;
  profession?: string;
  institution?: string;
  specialization?: string;
  is_active_member: boolean;
  membership_valid_until?: string;
  profile_photo?: string;
}

interface MessagingModalProps {
  member: Member;
  onClose: () => void;
}

const MessagingModal = ({ member, onClose }: MessagingModalProps) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲'];

  useEffect(() => {
    // Initialize current user ID
    const userId = getCurrentUserId();
    setCurrentUserId(userId);
    initializeConversation();
  }, [member.id]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const initializeConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting conversation with member:', member.id);
      
      // Start or get existing conversation with this member
      const conv = await messagingApi.startConversation(parseInt(member.id));
      console.log('Conversation created/retrieved:', conv);
      setConversation(conv);
      
      // Fetch messages for this conversation
      const messagesData = await messagingApi.getConversationMessages(conv.id);
      console.log('Messages data received:', messagesData);
      console.log('Individual messages:', messagesData.results);
      
      // Check each message for sender data
      messagesData.results.forEach((msg, index) => {
        console.log(`Message ${index}:`, {
          id: msg.id,
          sender: msg.sender,
          senderId: msg.sender?.id,
          content: msg.content,
          created_at: msg.created_at
        });
      });
      
      setMessages(messagesData.results.reverse()); // Reverse to show oldest first
    } catch (err) {
      console.error('Failed to initialize conversation:', err);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentUserId = (): number => {
    // Get current user ID from your auth system
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id || user.user_id || 1; // Try different possible keys
    console.log('Current user ID:', userId);
    return userId;
  };

  const handleSendMessage = async () => {
    if (!conversation || (!message.trim() && !selectedFile && !selectedImage)) return;

    const messageData: CreateMessageInput = {
      conversation: conversation.id,
      content: message.trim() || undefined,
    };

    if (selectedFile) {
      messageData.file_attachment = selectedFile;
      messageData.message_type = 'file';
    } else if (selectedImage) {
      messageData.image_attachment = selectedImage;
      messageData.message_type = 'image';
    } else if (emojis.some(emoji => message.includes(emoji))) {
      messageData.message_type = 'emoji';
    }

    if (replyTo) {
      messageData.reply_to = replyTo.id;
    }

    try {
      setSending(true);
      const newMessage = await messagingApi.sendMessage(messageData);
      console.log('New message sent:', newMessage);
      setMessages(prev => [...prev, newMessage]);
      setMessage('');
      setSelectedFile(null);
      setSelectedImage(null);
      setReplyTo(null);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleEditMessage = async () => {
    if (!editingMessage || !message.trim()) return;

    try {
      const updatedMessage = await messagingApi.editMessage(editingMessage.id, message.trim());
      setMessages(prev => 
        prev.map(msg => msg.id === editingMessage.id ? updatedMessage : msg)
      );
      setEditingMessage(null);
      setMessage('');
    } catch (err) {
      console.error('Failed to edit message:', err);
      setError('Failed to edit message.');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await messagingApi.deleteMessage(messageId);
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      console.error('Failed to delete message:', err);
      setError('Failed to delete message.');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImage(null);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setSelectedFile(null);
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    messageInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingMessage) {
        handleEditMessage();
      } else {
        handleSendMessage();
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (msg: Message): boolean => {
    if (!msg.sender) {
      console.log('Missing sender:', { sender: msg.sender });
      return false;
    }
    
    const senderId = msg.sender.id;
    
    // First check if it's actually the logged-in user
    if (currentUserId && senderId === currentUserId) {
      console.log('Message from logged-in user:', { messageId: msg.id, senderId, currentUserId });
      return true;
    }
    
    // If no messages from logged-in user, determine perspective based on member prop
    // The member you're viewing the conversation with should have their messages on the left
    // Everyone else should have messages on the right
    const memberIdNum = parseInt(member.id);
    const isFromViewedMember = senderId === memberIdNum;
    
    console.log('Message ownership check:', {
      messageId: msg.id,
      senderId,
      currentUserId,
      memberIdNum,
      isFromViewedMember,
      shouldShowOnRight: !isFromViewedMember,
      senderName: msg.sender.display_name || msg.sender.username
    });
    
    // Messages from the member you're viewing should be on the left (false)
    // Messages from others (including potentially you) should be on the right (true)
    return !isFromViewedMember;
  };

  // Check if user is trying to message themselves
  const isSelfMessage = () => {
    const currentUserId = getCurrentUserId();
    return parseInt(member.id) === currentUserId;
  };

  const getSenderDisplayName = (msg: Message) => {
    if (!msg.sender) return 'Unknown';
    return msg.sender.display_name || msg.sender.username || 'Unknown';
  };

  const getSenderImage = (msg: Message, isFromCurrentUser: boolean) => {
    // Always use the actual sender's profile photo from the message data
    if (msg.sender?.profile_photo) {
      return msg.sender.profile_photo;
    }
    
    // Fallback logic
    if (isFromCurrentUser) {
      // For messages on the right side, try current user's photo first
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.profile_photo) {
        return user.profile_photo;
      }
    } else {
      // For messages on the left side, try the member's photo
      if (member.profile_photo) {
        return member.profile_photo;
      }
    }
    
    return defaultProfileImage;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img
              src={member.profile_photo || defaultProfileImage}
              alt={`${member.first_name} ${member.last_name}`}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = defaultProfileImage;
              }}
            />
            <div>
              <h3 className="font-semibold text-gray-900">
                {member.first_name} {member.last_name}
              </h3>
              <p className="text-xs text-gray-500">{member.specialization || member.profession}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Self-message prevention */}
        {isSelfMessage() ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <X className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cannot message yourself</h3>
              <p className="text-gray-600">You cannot start a conversation with yourself.</p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Error Display */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-b border-red-200">
                <p className="text-sm text-red-600">{error}</p>
                <button 
                  onClick={() => setError(null)}
                  className="text-xs text-red-500 hover:text-red-700 underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-500">Loading conversation...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-center">Start the conversation with {member.first_name}</p>
                </div>
              ) : (
                messages
                  .filter(msg => msg && msg.sender) // Filter out messages with missing sender
                  .map((msg) => {
                    const isFromCurrentUser = isCurrentUser(msg);
                    
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start space-x-3 mb-4 ${
                          isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                        }`}
                      >
                        {/* Avatar */}
                        <img
                          src={getSenderImage(msg, isFromCurrentUser)}
                          alt={isFromCurrentUser ? 'You' : getSenderDisplayName(msg)}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = defaultProfileImage;
                          }}
                        />
                        
                        <div className={`max-w-xs lg:max-w-md ${isFromCurrentUser ? 'items-end' : 'items-start'} flex flex-col`}>
                          {/* Sender name (only show for received messages in group chats or for clarity) */}
                          {!isFromCurrentUser && (
                            <span className="text-xs text-gray-500 mb-1 px-1">
                              {getSenderDisplayName(msg)}
                            </span>
                          )}
                          
                          <div
                            className={`rounded-2xl px-4 py-2 group relative max-w-full break-words ${
                              isFromCurrentUser
                                ? 'bg-blue-600 text-white rounded-br-md'
                                : 'bg-gray-100 text-gray-800 rounded-bl-md'
                            }`}
                          >
                            {/* Reply indicator */}
                            {msg.reply_to && (
                              <div className={`text-xs mb-2 p-2 rounded-lg ${
                                isFromCurrentUser ? 'bg-blue-500' : 'bg-gray-200'
                              }`}>
                                <div className="font-semibold">{msg.reply_to.sender}</div>
                                <div className="truncate">{msg.reply_to.content}</div>
                              </div>
                            )}
                            
                            {/* Message content */}
                            {msg.message_type === 'image' && msg.image_url && (
                              <img
                                src={msg.image_url}
                                alt="Shared image"
                                className="max-w-full h-auto rounded-lg mb-2 cursor-pointer"
                                onClick={() => window.open(msg.image_url, '_blank')}
                              />
                            )}
                            
                            {msg.message_type === 'file' && msg.file_url && (
                              <div className="flex items-center space-x-2 mb-2">
                                <Paperclip className="w-4 h-4" />
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:no-underline"
                                >
                                  Download file
                                </a>
                              </div>
                            )}
                            
                            {msg.content && <p className="break-words">{msg.content}</p>}
                            
                            {/* Message info and actions */}
                            <div className={`flex items-center justify-between mt-2 ${
                              isFromCurrentUser ? 'flex-row-reverse' : ''
                            }`}>
                              <p
                                className={`text-xs ${
                                  isFromCurrentUser ? 'text-blue-100' : 'text-gray-500'
                                }`}
                              >
                                {formatTime(msg.created_at)}
                                {msg.is_edited && ' (edited)'}
                              </p>
                              
                              {/* Message actions */}
                              <div className={`flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ${
                                isFromCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
                              }`}>
                                <button
                                  onClick={() => setReplyTo(msg)}
                                  className={`p-1 hover:bg-opacity-20 hover:bg-white rounded ${
                                    isFromCurrentUser ? 'text-blue-100 hover:text-white' : 'text-gray-400 hover:text-gray-600'
                                  }`}
                                  title="Reply"
                                >
                                  <Reply className="w-3 h-3" />
                                </button>
                                
                                {isFromCurrentUser && (
                                  <>
                                    <button
                                      onClick={() => {
                                        setEditingMessage(msg);
                                        setMessage(msg.content || '');
                                      }}
                                      className="p-1 hover:bg-opacity-20 hover:bg-white rounded text-blue-100 hover:text-white"
                                      title="Edit"
                                    >
                                      <Edit className="w-3 h-3" />
                                    </button>
                                    
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="p-1 hover:bg-opacity-20 hover:bg-white rounded text-red-300 hover:text-red-100"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply indicator */}
            {replyTo && (
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Replying to {getSenderDisplayName(replyTo)}:</span>
                    <div className="text-gray-600 truncate">{replyTo.content}</div>
                  </div>
                  <button
                    onClick={() => setReplyTo(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Edit indicator */}
            {editingMessage && (
              <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">Editing message:</span>
                    <div className="text-gray-600 truncate">{editingMessage.content}</div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingMessage(null);
                      setMessage('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* File/Image preview */}
            {(selectedFile || selectedImage) && (
              <div className="px-4 py-2 bg-blue-50 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-medium">
                      {selectedImage ? '📷 Image selected' : '📎 File selected'}:
                    </span>
                    <div className="text-gray-600">
                      {(selectedFile || selectedImage)?.name}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setSelectedImage(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-20 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-h-32 overflow-y-auto z-10">
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      onClick={() => handleEmojiSelect(emoji)}
                      className="text-lg hover:bg-gray-100 p-1 rounded"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowEmojiPicker(false)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex items-end space-x-2">
                {/* Attachment buttons */}
                <div className="flex space-x-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="*/*"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Attach file"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  
                  <input
                    ref={imageInputRef}
                    type="file"
                    onChange={handleImageSelect}
                    className="hidden"
                    accept="image/*"
                  />
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Attach image"
                  >
                    <Image className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    title="Add emoji"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Message input */}
                <textarea
                  ref={messageInputRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={editingMessage ? "Edit your message..." : "Write a message..."}
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none min-h-[40px] max-h-32"
                  rows={1}
                  disabled={loading}
                />
                
                {/* Send button */}
                <button
                  onClick={editingMessage ? handleEditMessage : handleSendMessage}
                  disabled={(!message.trim() && !selectedFile && !selectedImage) || sending || loading}
                  className={`p-2 rounded-lg ${
                    (!message.trim() && !selectedFile && !selectedImage) || sending || loading
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagingModal;