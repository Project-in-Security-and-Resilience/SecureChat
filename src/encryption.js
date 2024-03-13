import CryptoJS from 'crypto-js';

const SECRET_KEY = '12345678903dd345522'; // Consider using a more secure way to generate and store this key

export const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, SECRET_KEY).toString();
};

export const decryptMessage = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};