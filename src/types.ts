export interface User {
  id: string;
  username: string;
  email: string;
  publicKey: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export type EncryptionStatus = 'encrypted' | 'unencrypted' | 'error';

export interface EncryptionResult {
  status: EncryptionStatus;
  data?: string;
  error?: string;
} 