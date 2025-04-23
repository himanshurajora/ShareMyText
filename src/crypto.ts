import * as Crypto from 'crypto-js';

/**
 * Encrypts data using AES encryption
 * @param data The data to encrypt
 * @param key The encryption key
 * @returns The encrypted data
 */
export const encryptData = (data: string, key: string): string => {
  return Crypto.AES.encrypt(data, key).toString();
};

/**
 * Decrypts data using AES decryption
 * @param encryptedData The encrypted data
 * @param key The decryption key
 * @returns The decrypted data
 */
export const decryptData = (encryptedData: string, key: string): string => {
  const bytes = Crypto.AES.decrypt(encryptedData, key);
  return bytes.toString(Crypto.enc.Utf8);
};

/**
 * Generates a new key pair for asymmetric encryption
 * @returns An object containing the public and private keys
 */
export const generateKeyPair = () => {
  // For now, we're using symmetric encryption with AES
  // In a production environment, you might want to use RSA or other asymmetric encryption
  const key = Crypto.lib.WordArray.random(16).toString();
  return {
    publicKey: key,
    privateKey: key
  };
};

/**
 * Exports a public key in a format suitable for sharing
 * @param publicKey The public key to export
 * @returns The exported public key
 */
export const exportPublicKey = (publicKey: string): string => {
  return publicKey;
};

/**
 * Imports a public key from a shared format
 * @param exportedKey The exported public key
 * @returns The imported public key
 */
export const importPublicKey = (exportedKey: string): string => {
  return exportedKey;
}; 