import { caesarCipher } from "@/lib/utils";
import { useState } from "react";

const isBrowser = typeof window !== "undefined";

/**
 * Custom hook to manage state with localStorage
 *
 * @param key {string} - The key in localStorage
 * @param initialValue {any} - The initial value for the state
 * @param shift {number} - The shift value for the Caesar Cipher (optional, defaults to 3 if not set)
 * @param base64 {boolean} - Whether to Base64 encode/decode the encrypted values (optional, defaults to false)
 *
 * @returns {[T, (value: T) => void, () => void]} - The current state, a function to update it, and a function to reset it
 */
function useLocalStorage<T>(
  key: string,
  initialValue: T,
  shift: number = Number(process.env.NEXT_PUBLIC_CIPHER_SHIFT || 3), // Use env variable or default to 3
  base64: boolean = true // Default is Base64 encoding
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (!isBrowser) return initialValue;

    try {
      // Encrypt the key before accessing localStorage
      const encryptedKey = caesarCipher(key, shift, "encode", base64);

      const item = window.localStorage.getItem(encryptedKey);

      if (item) {
        try {
          // Decrypt the value and parse it back to the original type
          const decryptedItem = caesarCipher(item, shift, "decode", base64);
          return decryptedItem ? JSON.parse(decryptedItem) : initialValue;
        } catch (decryptionError) {
          console.error(
            `Failed to decrypt or parse localStorage item for key "${key}":`,
            decryptionError
          );
          return initialValue;
        }
      }

      // return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // Convert object to string before encryption
      const stringifiedValue = JSON.stringify(valueToStore);

      // Encrypt the key and the value before saving
      const encryptedKey = caesarCipher(key, shift, "encode", base64);
      const encryptedValue = caesarCipher(
        stringifiedValue,
        shift,
        "encode",
        base64
      );

      setStoredValue(valueToStore);
      if (isBrowser) {
        window.localStorage.setItem(encryptedKey, encryptedValue);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const resetValue = () => {
    try {
      const encryptedKey = caesarCipher(key, shift, "encode", base64);
      if (isBrowser) {
        window.localStorage.removeItem(encryptedKey);
      }
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Failed to reset localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, resetValue];
}

export default useLocalStorage;
