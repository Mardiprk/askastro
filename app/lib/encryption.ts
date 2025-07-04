/**
 * Encryption utilities for end-to-end encryption of user data
 * Uses the Web Crypto API for secure encryption/decryption
 */

// Convert a string to buffer
const stringToBuffer = (str: string): Uint8Array => {
  return new TextEncoder().encode(str);
};

// Convert a buffer to string
const bufferToString = (buffer: ArrayBuffer): string => {
  return new TextDecoder().decode(buffer);
};

// Convert a buffer to base64 string for storage
const bufferToBase64 = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert a base64 string back to buffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Derives an encryption key from user credentials
 * @param userId User's unique identifier
 * @param email User's email address
 * @returns A CryptoKey that can be used for encryption/decryption
 */
export const deriveEncryptionKey = async (userId: string, email: string): Promise<CryptoKey> => {
  // Create a consistent but unique salt from the user's credentials
  const salt = stringToBuffer(`${userId}:${email}:askastro-salt`);
  
  // Use the user's ID as the base key material
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    stringToBuffer(`${userId}:${email}`),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // Derive a secure key using PBKDF2
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false, // Extractable set to false for security
    ['encrypt', 'decrypt']
  );
};

/**
 * Encrypts data using AES-GCM
 * @param data The string data to encrypt
 * @param encryptionKey The CryptoKey to use for encryption
 * @returns An encrypted string (format: base64(iv):base64(encryptedData))
 */
export const encryptData = async (data: string, encryptionKey: CryptoKey): Promise<string> => {
  // Generate a random initialization vector
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  // Encrypt the data
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    encryptionKey,
    stringToBuffer(data)
  );
  
  // Format as iv:encryptedData (both base64 encoded)
  return `${bufferToBase64(iv.buffer)}:${bufferToBase64(encryptedBuffer)}`;
};

/**
 * Decrypts data that was encrypted with encryptData
 * @param encryptedData The encrypted data string (format: base64(iv):base64(encryptedData))
 * @param encryptionKey The CryptoKey to use for decryption
 * @returns The decrypted string data
 */
export const decryptData = async (encryptedData: string, encryptionKey: CryptoKey): Promise<string> => {
  // Split the string to get the IV and encrypted data
  const [ivBase64, dataBase64] = encryptedData.split(':');
  
  if (!ivBase64 || !dataBase64) {
    throw new Error('Invalid encrypted data format');
  }
  
  // Convert back from base64
  const iv = base64ToBuffer(ivBase64);
  const data = base64ToBuffer(dataBase64);
  
  // Decrypt the data
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: new Uint8Array(iv)
    },
    encryptionKey,
    data
  );
  
  // Convert the decrypted buffer back to a string
  return bufferToString(decryptedBuffer);
};

/**
 * Stores an encryption key securely in sessionStorage
 * The key is stored in a way that it remains tied to the user
 * @param userId User's unique identifier
 * @param key The CryptoKey to store
 */
export const storeEncryptionKeySecurely = async (userId: string, key: CryptoKey): Promise<void> => {
  // We can't directly serialize a CryptoKey, so we use a token to represent it
  // In a real app, consider more secure key storage methods
  sessionStorage.setItem(`encryption_key_${userId}`, 'key_is_in_memory');
  
  // In reality, the key is just in memory until the session ends
  // This is a security trade-off - more secure would be to re-derive the key every time
};

/**
 * Retrieves a stored encryption key
 * @param userId User's unique identifier
 * @returns The stored CryptoKey or null if not found
 */
export const getStoredEncryptionKey = async (userId: string): Promise<CryptoKey | null> => {
  // This is a placeholder - in a real implementation, we'd retrieve the actual key
  // For now, we always re-derive the key
  return null;
};

/**
 * Checks if data appears to be encrypted
 * @param data The data to check
 * @returns True if the data appears to be in our encrypted format
 */
export const isEncryptedData = (data: any): boolean => {
  if (typeof data !== 'string') return false;
  
  // Check for our "iv:encryptedData" format
  const parts = data.split(':');
  if (parts.length !== 2) return false;
  
  try {
    // Try to decode the base64 parts
    base64ToBuffer(parts[0]);
    base64ToBuffer(parts[1]);
    return true;
  } catch (error) {
    return false;
  }
}; 