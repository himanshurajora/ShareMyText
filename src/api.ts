import { User, Message, Chat } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function loginUser(email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Login failed');
  }

  return response.json();
}

export async function registerUser(username: string, email: string, password: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, email, password }),
  });

  if (!response.ok) {
    throw new Error('Registration failed');
  }

  return response.json();
}

export async function sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
  const response = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  return response.json();
}

export async function getChats(userId: string): Promise<Chat[]> {
  const response = await fetch(`${API_BASE_URL}/chats?userId=${userId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch chats');
  }

  return response.json();
}

export async function getMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE_URL}/messages?chatId=${chatId}`);

  if (!response.ok) {
    throw new Error('Failed to fetch messages');
  }

  return response.json();
}

export async function updateUserPublicKey(userId: string, publicKey: string): Promise<User> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/public-key`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicKey }),
  });

  if (!response.ok) {
    throw new Error('Failed to update public key');
  }

  return response.json();
} 