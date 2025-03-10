import {
  addDoc,
  arrayUnion,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

export type ActionType = "update" | "get" | "delete";

export type TokenEntry = {
  task: string;
  date: string;
  tokens: number;
};

// Define the User type
export interface User {
  device_info: {
    os: string;
    browser: string;
    model: string;
    screen_resolution: string;
    is_mobile: boolean;
  };
  isNewUser: {
    isClaimed: boolean; // Boolean property to track if bundle code is claimed
    bundleCode: string;
    date: string;
  };
  referralMilestones: {
    [key: string]: boolean;
  };
  challengeMilestone: boolean;
  ip_address: string;
  id: string;
  username: string;
  total_tokens: number;
  tokens: number;
  token_history: { [key: string]: TokenEntry };
  email: string;
  mno: string;
  phone_number: string;
  country: string; // User's country
  timezone: string;
  language: string;
  is_dark_mode: boolean;
  user_agent: string;
  last_login: string;
  login_method: string;
  referrer: string;
  created_at: string;
  isBlocked: boolean;
  fraudDetected: boolean;
}

// Define interfaces for Friend and User models
export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  airtime: number | null;
  data: string | null;
  tokens: number | null;
  is_claimed: boolean;
  created_at: string;
}

export type Challenge = {
  id: string;
  title: string;
  description: string;
  tokens: number;
  method:
    | "checkDailyInvitationStreak"
    | "checkDoubleReferralStreak"
    | "trackTwelveHourInvitations"
    | "countWeeklyInvites"
    | "countNightTimeInvites"
    | "countWeekendInvites"
    | "checkWeekLongStreak"
    | "countHourlySprintInvites"
    | "countDailyInvites"; // Completion method
  created_at: string;
  completed_user_ids: string[]; // List of user IDs who completed it
};

// Function to get user country and IP address
export const getUserLocation = async () => {
  try {
    const response = await fetch(
      `https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_IP_TOKEN}`
    ); // Replace with your API token
    const data = await response.json();
    return { country: data.country, ip: data.ip };
  } catch (error) {
    console.error("Error fetching location:", error);
    return { country: "Unknown", ip: "0.0.0.0" };
  }
};

// Function to get device information (OS, Browser, Device Model)
export const getDeviceInfo = () => {
  const userAgent = navigator.userAgent;
  let os = "Unknown OS";
  let browser = "Unknown Browser";
  let deviceModel = "Unknown Device";

  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac/i.test(userAgent)) os = "MacOS";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(userAgent)) os = "iOS";

  if (/Chrome/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent)) browser = "Safari";
  else if (/Edge/i.test(userAgent)) browser = "Edge";

  if (/iPhone/i.test(userAgent)) deviceModel = "iPhone";
  else if (/Samsung/i.test(userAgent)) deviceModel = "Samsung";
  else if (/Pixel/i.test(userAgent)) deviceModel = "Google Pixel";
  else if (/Windows/i.test(userAgent)) deviceModel = "PC";
  else if (/Mac/i.test(userAgent)) deviceModel = "MacBook";

  return { os, browser, deviceModel };
};

// Function to check dark mode preference
export const isDarkModeEnabled = () => {
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

// Function to get screen resolution
export const getScreenResolution = () => {
  return `${window.screen.width}x${window.screen.height}`;
};

/**
 * Level thresholds for user progression.
 */
export const levelLists = [120, 250, 340, 460, 600, 750, 920, 1100, 1300];

/**
 * Determines the user's level based on token count.
 *
 * @param {number} tokens - The number of tokens the user has.
 * @returns {number} The calculated user level.
 */
export function calculateUserLevel(tokens: number): number {
  for (let i = 0; i < levelLists.length; i++) {
    if (tokens < levelLists[i]) return i + 1;
  }
  return levelLists.length + 1; // If tokens exceed the last level
}

/**
 * Implements the Caesar Cipher encryption/decryption algorithm.
 * It supports both encoding and decoding modes, and optionally encodes/decodes the result in Base64.
 *
 * @param {string} text - The input text to be encrypted or decrypted.
 * @param {number} shift - The number of positions to shift each character in the text.
 * @param {'encode'|'decode'} mode - The operation mode ('encode' for encryption, 'decode' for decryption).
 * @param {boolean} [base64=false] - Whether to encode/decode the result in Base64.
 * @returns {string} The resulting text after applying the Caesar Cipher and optional Base64 encoding/decoding.
 */
export function caesarCipher(
  text: string,
  shift: number,
  mode: "encode" | "decode",
  base64: boolean = false
): string {
  let result = "";

  // Ensure the shift is within the range of the alphabet
  shift = ((shift % 26) + 26) % 26; // Adjust shift to be positive and within range

  if (base64 && mode === "decode") {
    text = atob(text); // Decode Base64 before applying Caesar cipher
  }

  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    let asciiOffset: number, newCharAscii: number;

    // Check if the character is a letter
    if (char.match(/[a-z]/i)) {
      asciiOffset =
        char.toLowerCase() === char ? "a".charCodeAt(0) : "A".charCodeAt(0);
      const charAscii = char.charCodeAt(0);
      if (mode === "encode") {
        newCharAscii = ((charAscii - asciiOffset + shift) % 26) + asciiOffset;
      } else {
        // Decoding mode
        newCharAscii =
          ((charAscii - asciiOffset - shift + 26) % 26) + asciiOffset;
      }
    } else if (char.match(/[0-9]/)) {
      // Check if the character is a number
      asciiOffset = "0".charCodeAt(0);
      const charAscii = char.charCodeAt(0);
      if (mode === "encode") {
        newCharAscii = ((charAscii - asciiOffset + shift) % 10) + asciiOffset;
      } else {
        // Decoding mode
        newCharAscii =
          ((charAscii - asciiOffset - shift + 10) % 10) + asciiOffset;
      }
    } else {
      // If it's not a letter or number, just append it as is
      result += char;
      continue;
    }

    result += String.fromCharCode(newCharAscii);
  }

  if (base64 && mode === "encode") {
    result = btoa(result); // Encode result to Base64 after applying Caesar cipher
  }

  return result;
}

export const BLACKLIST_COLLECTION = "fraud_detection"; // Collection for fraud records
export const BLACKLIST_DOC = "blacklist_emails"; // Document storing blacklisted emails

/**
 * Fraud detection: fetch blocked users, get blacklisted emails, or add an email to the blacklist.
 * @param {"getBlockedUsers" | "getBlacklistedEmails" | "addEmailToBlacklist"} action - Action to perform.
 * @param {string} [email] - Email to blacklist (only for "addEmailToBlacklist").
 */
export const fraudDetection = async (
  action: "getBlockedUsers" | "getBlacklistedEmails" | "addEmailToBlacklist",
  email?: string
) => {
  try {
    if (action === "getBlockedUsers") {
      // 🚨 Fetch users flagged for fraud
      const usersRef = collection(db, "users");
      const blockedUsersSnapshot = await getDocs(usersRef);

      // Filter users who have `isBlocked` or `fraudDetected` set to true
      return blockedUsersSnapshot.docs
        .map((doc) => doc.data()) // No explicit id assignment
        .filter((user) => user?.isBlocked || user?.fraudDetected);
    }

    if (action === "getBlacklistedEmails") {
      // 🚨 Retrieve blacklisted emails from Firestore
      const blacklistRef = doc(db, BLACKLIST_COLLECTION, BLACKLIST_DOC);
      const blacklistSnapshot = await getDoc(blacklistRef);
      return blacklistSnapshot.exists()
        ? blacklistSnapshot.data().emails || []
        : [];
    }

    if (action === "addEmailToBlacklist" && email) {
      // 🚨 Add email to blacklist if not already present
      const blacklistRef = doc(db, BLACKLIST_COLLECTION, BLACKLIST_DOC);
      const currentBlacklist = await fraudDetection("getBlacklistedEmails");
      if (!currentBlacklist.includes(email)) {
        await updateDoc(blacklistRef, {
          emails: [...currentBlacklist, email],
        });
      }
    }
  } catch (error) {
    console.error("Fraud detection error:", error);
    return null;
  }
};

/**
 * Merges parts of the given usernames to generate combinations,
 * and filters out those that are already in the usedUsernames array.
 *
 * @param usernames - An array of usernames, each consisting of two parts separated by a space.
 * @param usedUsernames - An array of usernames that should be excluded from the generated combinations.
 *
 * @returns An array of new username combinations that are not present in the usedUsernames array.
 */
export function mergeUsername(
  usernames: string[],
  usedUsernames: string[]
): string[] {
  const firstParts: string[] = [];
  const secondParts: string[] = [];

  // Split the usernames into two parts and store them in separate arrays
  usernames.forEach((username) => {
    const [firstPart, secondPart] = username.split(" ");
    firstParts.push(firstPart);
    secondParts.push(secondPart);
  });

  const combinations: Set<string> = new Set();

  // Generate all possible combinations without duplicates
  firstParts.forEach((first) => {
    secondParts.forEach((second) => {
      const combination = `${first} ${second}`;
      // Only add the combination if it's not in the usedUsernames array and not a duplicate
      if (
        !usedUsernames.includes(combination) &&
        // ! This is temporary: Excluding leaderboard names to prevent conflicts
        ![
          "Bouncy Bobcat",
          "Friendly Fox",
          "Happy Hedgehog",
          "Humble Hornbill",
          "Swift Swordfish",
          "Lucky Lark",
          "Cheerful Cheetah",
          "Jolly Jaguar",
          "Gentle Gazelle",
        ].includes(combination) &&
        !combinations.has(combination)
      ) {
        combinations.add(combination);
      }
    });
  });

  return Array.from(combinations).sort(() => Math.random() - 0.5);
}

export class numberFormatter {
  private cleanedNumber: string;
  private countryCode: string;

  /**
   * Constructs a new instance of the NumberFormatter class.
   * Validates the provided country code and cleans the phone number.
   *
   * @param {string} number - The raw phone number to format.
   * @param {string} countryCode - The country code associated with the phone number.
   */
  constructor(number: string, countryCode: string) {
    number = number.trim();
    this.cleanedNumber = number.replace(/\D/g, ""); // Remove non-digits
    this.countryCode = countryCode.trim();

    // Validate the country code
    if (!this.countryCode.startsWith("+")) {
      throw new Error("Country code must start with '+'");
    }
    // Validate the country code length
    if (this.countryCode.length < 2 || this.countryCode.length > 4) {
      throw new Error(
        "Country code length must be between 2 and 4 characters after '+'"
      );
    }

    // Clean the phone number and remove the initial '0' if present in one step
    this.cleanedNumber = number.replace(/\D/g, "");
    this.countryCode = countryCode;

    // Additional validation to prevent common mistakes
    this.validatePrefix();
  }

  /**
   * Validates the prefix of the cleaned phone number against known common mistakes.
   */
  private validatePrefix(): void {
    // Define commonMistakes with an index signature
    const commonMistakes: { [key: string]: string[] } = {
      "+234": ["018", "008", "019", "009", "017", "007"], // Example for Nigeria (+234)
      // Add more country codes and their common mistakes here
    };

    const prefix = this.cleanedNumber.substring(0, 3); // Assuming the first 3 digits are the prefix
    if (commonMistakes[this.countryCode]?.includes(prefix)) {
      throw new Error(
        `Common mistake detected: '${prefix}' is not a valid prefix for ${this.countryCode}.`
      );
    }
  }

  /**
   * Returns the phone number formatted with the country code prefix.
   *
   * @returns {string} The phone number with the country code prefix.
   */
  withPrefix(): string {
    const normalizedNumber = this.cleanedNumber.replace(/^0+/, "");
    const formatted = `${this.countryCode}${normalizedNumber}`;

    if (!formatted.startsWith("+") || formatted.length > 15) {
      throw new Error(
        "Invalid phone number format: Must start with '+' and be <= 15 digits."
      );
    }
    return formatted;
  }

  /**
   * Returns the phone number without the country code prefix.
   *
   * @returns {string} The phone number without the country code prefix.
   */
  withoutPrefix(): string {
    return this.cleanedNumber;
  }

  /**
   * Returns only the country code prefix.
   *
   * @returns {string} The country code prefix.
   */
  getPrefix(): string {
    return this.countryCode;
  }

  /**
   * Checks if the phone number is considered valid based on its length.
   *
   * @returns {boolean} True if the phone number is valid, false otherwise.
   */
  isValid(): boolean {
    // Basic validation: check if the cleaned phone number has a reasonable length
    return this.cleanedNumber.length >= 7 && this.cleanedNumber.length <= 15;
  }
}

/**
 * Type definition for Mobile Network Operator (MNO) data.
 */
export type MNOData = {
  name: "mtn" | "airtel" | "glo";
  prefix: string[];
};

/**
 * Determines the Mobile Network Operator (MNO) based on the prefix of a given Nigerian phone number.
 *
 * @param {string} number - The phone number to identify the MNO for.
 * @returns {string} The name of the identified MNO or 'Unknown' if not identifiable.
 */
export function getMNO(number: string): "mtn" | "airtel" | "glo" | "Unknown" {
  // Normalize the phone number by replacing '+234' with '0' if present
  const formattedNumber = number.startsWith("+234")
    ? number.replace("+234", "0")
    : number;

  // Predefined MNO data
  const mnoData: MNOData[] = [
    {
      name: "airtel",
      prefix: [
        "0802",
        "0808",
        "0708",
        "0812",
        "0701",
        "0902",
        "0901",
        "0904",
        "0907",
        "0912",
      ],
    },
    {
      name: "mtn",
      prefix: [
        "0803",
        "0806",
        "0703",
        "0706",
        "0813",
        "0816",
        "0810",
        "0814",
        "0903",
        "0906",
        "0913",
        "0916",
        "07025",
        "07026",
        "0704",
      ],
    },
    {
      name: "glo",
      prefix: ["0805", "0807", "0705", "0815", "0811", "0905", "0915"],
    },
  ];

  // Create a map for efficient lookup of MNO by prefix
  const prefixMap: { [key: string]: "mtn" | "airtel" | "glo" } = {};
  mnoData.forEach((mno) => {
    mno.prefix.forEach((prefix) => {
      prefixMap[prefix] = mno.name; // Map each prefix to its corresponding MNO name
    });
  });

  // Iterate over the map to find a match for the formatted number's prefix
  for (const prefix in prefixMap) {
    if (formattedNumber.startsWith(prefix)) {
      return prefixMap[prefix]; // Return the MNO name if a match is found
    }
  }

  // If no matching prefix is found, return 'Unknown'
  return "Unknown";
}

export class VTUService {
  private username: string;
  private password: string;

  /**
   * VTUService class to handle API interactions for airtime and data services.
   */
  constructor() {
    this.username = process.env.NEXT_PUBLIC_VTU_USERNAME!;
    this.password = process.env.NEXT_PUBLIC_VTU_PASSWORD!;
  }

  /**
   * Sends a GET request to the specified endpoint with the given parameters.
   * @param endpoint - The API endpoint URL.
   * @param params - An object containing query parameters for the request.
   * @returns The JSON response from the API.
   * @throws Will throw an error if the response is not ok.
   */
  private async request<T>(
    endpoint: string,
    params: Record<string, string>
  ): Promise<T> {
    const queryString = new URLSearchParams(params).toString();
    const url = `${endpoint}?${queryString}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${this.username}:${this.password}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Gets airtime for a specified phone number and network.
   * @param phone - The phone number to which airtime will be sent.
   * @param network_id - The network ID for the airtime provider.
   * @param amount - The amount of airtime to be purchased.
   * @returns The JSON response from the airtime API.
   */
  public async topUpAirtime(
    phone: string,
    network_id: "mtn" | "airtel" | "glo",
    amount: number
  ): Promise<{ success: boolean; message: string }> {
    const endpoint = "https://vtu.ng/wp-json/api/v1/airtime";
    const params = {
      username: this.username,
      password: this.password,
      phone,
      network_id,
      amount: amount.toString(),
    };

    return this.request(endpoint, params);
  }

  /**
   * Gets data for a specified phone number, network, and variation ID.
   * @param phone - The phone number to which data will be sent.
   * @param network_id - The network ID for the data provider.
   * @param variation_id - The variation ID for the specific data plan.
   * @returns The JSON response from the data API.
   */
  public async topUpData(
    phone: string,
    network_id: "mtn" | "airtel" | "glo",
    variation_id: string
  ): Promise<{ success: boolean; message: string }> {
    const endpoint = "https://vtu.ng/wp-json/api/v1/data";
    const params = {
      username: this.username,
      password: this.password,
      phone,
      network_id,
      variation_id,
    };

    return this.request(endpoint, params);
  }

  /**
   * Checks the VTU balance.
   * @returns The JSON response with the balance details.
   */
  public async checkBalance(): Promise<{
    data: {
      balance: number;
    };
  }> {
    const endpoint = "https://vtu.ng/wp-json/api/v1/balance";
    const params = {
      username: this.username,
      password: this.password,
    };

    return this.request(endpoint, params);
  }

  /**
   * Checks if the balance is above 3000 to validate the service for use.
   * @returns A boolean indicating whether the balance is valid for use.
   */
  public async isBalanceValidForUse(): Promise<boolean> {
    try {
      const response = await this.checkBalance();
      return response.data.balance > 3000;
    } catch (error) {
      console.error("Failed to check balance:", error);
      return false;
    }
  }
}

/**
 * Returns a random reward value from the specified type of data for a given network.
 *
 * @param network - The network to fetch data from. It should be one of 'mtn', 'airtel', or 'glo'.
 * @param type - The type of reward to fetch. It should be either 'airtime' or 'data'.
 * @returns A random value from the specified type of data for the given network.
 *          For 'airtime', the value will be a number.
 *          For 'data', the value will be a string.
 * @throws Error if the network or type is not found.
 */
export function getVTUReward(
  network: "mtn" | "airtel" | "glo",
  type: "airtime" | "data"
): number | string {
  // Define a map to store network data with arrays for airtime and data
  const networks = new Map<
    "mtn" | "airtel" | "glo",
    { airtime: number[]; data: string[] }
  >([
    [
      "mtn",
      {
        airtime: [300, 500, 300, 100, 300, 500, 300, 300, 300, 500, 100],
        data: ["500", "M1024", "500", "500", "M1024"],
      },
    ],
    [
      "airtel",
      {
        airtime: [300, 500, 300, 100, 300, 500, 300, 300, 300, 500, 100],
        data: [
          "AIRTEL1GB",
          "AIRTEL500MB",
          "AIRTEL1GB",
          "AIRTEL1GB",
          "AIRTEL500MB",
        ],
      },
    ],
    [
      "glo",
      {
        airtime: [300, 500, 300, 100, 300, 500, 300, 300, 300, 500, 100],
        data: ["glo100x", "glo200x", "G500", "glo100x", "glo200x", "glo100x"],
      },
    ],
  ]);

  // Retrieve the data for the specified network
  const networkData = networks.get(network);
  if (!networkData) {
    throw new Error(`Network ${network} not found`);
  }

  // Retrieve the values for the specified type (airtime or data)
  const values = networkData[type];
  if (!values) {
    throw new Error(`Type ${type} not found for network ${network}`);
  }

  // Select a random index from the values array
  const randomIndex = Math.floor(Math.random() * values.length);
  return values[randomIndex];
}

/**
 * Converts a data bundle identifier to its corresponding size (e.g., "1GB", "500MB").
 * @param bundleCode - The code representing the data bundle (e.g., "M1024", "airt-550").
 * @returns The human-readable data size (e.g., "1GB", "750MB") or the original bundle code if unrecognized.
 */
export function convertBundle(bundleCode: string): string {
  // Define a flat mapping of bundle codes to their corresponding sizes
  const bundleMappings: Record<string, string> = {
    "500": "500MB",
    M1024: "1GB",
    AIRTEL1GB: "1GB",
    AIRTEL500MB: "500MB",
    glo100x: "1GB",
    glo200x: "1.25GB",
    G500: "1.35GB",
  };

  // Return the mapped size or the original bundle code if not found
  return bundleMappings[bundleCode] || bundleCode;
}

/**
 * A single function to manage user tokens operations.
 * @param action - The operation to perform ("get", "add", "remove", "set", "convert").
 * @param payload - The required data for the specified action.
 * @returns The result of the action (tokens, converted value, or null in case of error).
 */
export const tokensManager = async (
  action: "get" | "add" | "remove" | "set" | "convert",
  payload: {
    userId?: string;
    tokens?: number;
    network?: "mtn" | "airtel" | "glo"; // Network type for tokens conversion
  }
): Promise<number | string | null> => {
  try {
    // Handle different actions based on the `action` parameter
    switch (action) {
      case "get": // Fetch user's current tokens
        if (!payload.userId) {
          throw new Error("User ID is required to fetch tokens.");
        }

        // Query the "users" collection to find the user with the given ID
        const q = query(
          collection(db, "users"),
          where("id", "==", payload.userId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]; // Get the first matching document
          return userDoc.data().tokens || 0; // Return user's tokens or 0 if undefined
        }

        throw new Error(`User with ID ${payload.userId} not found.`);

      case "add": // Add tokens to the user's account
        if (!payload.userId || payload.tokens === undefined) {
          throw new Error("User ID and tokens are required to add tokens.");
        }

        // Get the user's current tokens
        const currentTokens = await tokensManager("get", {
          userId: payload.userId,
        });

        if (typeof currentTokens === "number") {
          const updatedTokens = currentTokens + payload.tokens; // Calculate new tokens
          const userDocRef = doc(db, "users", payload.userId); // Reference to the user's document

          // Update Firestore in a single call
          await updateDoc(userDocRef, {
            tokens: updatedTokens,
            total_tokens: updatedTokens,
          });
          return updatedTokens; // Return updated tokens
        }

        throw new Error("Failed to fetch user tokens for adding.");

      case "remove": // Remove tokens from the user's account
        if (!payload.userId || payload.tokens === undefined) {
          throw new Error("User ID and tokens are required to remove tokens.");
        }

        // Get the user's current tokens
        const currentTokensForRemoval = await tokensManager("get", {
          userId: payload.userId,
        });

        if (typeof currentTokensForRemoval === "number") {
          // Ensure tokens don't go below zero
          const updatedTokens = Math.max(
            currentTokensForRemoval - payload.tokens,
            0
          );
          const userDocRef = doc(db, "users", payload.userId); // Reference to the user's document
          await updateDoc(userDocRef, { tokens: updatedTokens }); // Update Firestore document
          return updatedTokens; // Return updated tokens
        }

        throw new Error("Failed to fetch user tokens for removal.");

      case "set": // Set the user's tokens to a specific value
        if (!payload.userId || payload.tokens === undefined) {
          throw new Error("User ID and tokens are required to set tokens.");
        }

        const userDocRefForSet = doc(db, "users", payload.userId); // Reference to the user's document
        await updateDoc(userDocRefForSet, { tokens: payload.tokens }); // Update Firestore document
        return payload.tokens; // Return the newly set tokens value

      case "convert": // Convert tokens to a value based on the selected network
        if (!payload.network || payload.tokens === undefined) {
          throw new Error("Network and tokens are required for conversion.");
        }

        // Define the conversion table for each network
        const networks: {
          [key in "mtn" | "airtel" | "glo"]: Map<number, number>;
        } = {
          mtn: new Map([
            [100, 100],
            [200, 200],
            [500, 500],
            [1000, 1000],
          ]),
          airtel: new Map([
            [100, 100],
            [200, 200],
            [500, 500],
            [1000, 1000],
          ]),
          glo: new Map([
            [100, 100],
            [200, 200],
            [500, 500],
            [1000, 1000],
          ]),
        };

        const networkData = networks[payload.network]; // Get the network conversion map
        const convertedValue = networkData.get(payload.tokens); // Get the converted value for the given token

        if (convertedValue !== undefined) {
          return convertedValue; // Return the converted value
        }

        throw new Error(
          `Tokens ${payload.tokens} not available for network ${payload.network}.`
        );

      default:
        throw new Error(`Unsupported action: ${action}`);
    }
  } catch (error) {
    console.error("Error in tokensManager:", error);
    return null; // Return null in case of error
  }
};

/**
 * Manages a user's token history, supporting get, update, and delete actions.
 * Ensures the token history always contains exactly 3 entries when updating.
 *
 * @param userId - The ID of the user whose token history is being modified.
 * @param action - The action to perform: "get", "update", or "delete".
 * @param newTask - (Optional) The new task to add when updating.
 */
export const manageTokenHistory = async (
  userId: string,
  action: ActionType,
  newTask?: TokenEntry
) => {
  const userRef = doc(db, "users", userId);

  try {
    switch (action) {
      case "get": {
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
          console.log("User document does not exist.");
          return null;
        }
        console.log("User token history:", userSnap.data().token_history || {});
        return userSnap.data().token_history || {};
      }

      case "update": {
        if (!newTask) {
          console.error(
            "New task object is required for updating token history."
          );
          return;
        }

        const userSnap = await getDoc(userRef);
        const token_history = userSnap.exists()
          ? userSnap.data().token_history || {}
          : {};

        // Convert object to sorted array
        const historyEntries = Object.entries(token_history)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([, value]) => value); // Extract only values

        // Ensure we always keep **at most 7** entries
        if (historyEntries.length >= 7) {
          historyEntries.shift(); // Remove oldest entry
        }

        // Add new task
        historyEntries.push(newTask);

        // Re-index history (keys from 0 to 6)
        const updatedTokenHistory = Object.fromEntries(
          historyEntries.map((entry, index) => [index.toString(), entry])
        );

        // Save back to Firestore
        await updateDoc(userRef, { token_history: updatedTokenHistory });
        console.log("User token history updated successfully!");
        break;
      }

      case "delete": {
        await updateDoc(userRef, { token_history: deleteField() });
        console.log("User token history deleted successfully!");
        break;
      }

      default:
        console.error("Invalid action type. Use 'get', 'update', or 'delete'.");
    }
  } catch (error) {
    console.error(`Error performing ${action} on user token history:`, error);
  }
};

/**
 * Perform all challenge-related operations.
 * @param action - The operation to perform: "fetch", "filter", "addUser", or "create".
 * @param payload - Data needed for the operation (varies by action).
 * @returns Result of the operation or null in case of an error.
 */
export const manageChallenges = async (
  action: "fetch" | "filter" | "addUser" | "create",
  payload?: {
    challenges?: Challenge[];
    userId?: string;
    challengeId?: string;
    challengeData?: {
      title: string;
      description: string;
      tokens: number;
      method: string;
    };
  }
): Promise<Challenge[] | Challenge | null> => {
  try {
    switch (action) {
      case "fetch":
        // Fetch all challenges from the "challenges" collection
        const querySnapshot = await getDocs(collection(db, "challenges"));
        // Map Firestore documents to an array of objects, including document ID
        return querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Challenge[];

      case "filter":
        // Ensure challenges array and userId are provided
        if (!payload?.challenges || !payload.userId) {
          throw new Error("Challenges and userId are required for filtering.");
        }
        // Filter challenges to find those the user hasn't completed
        return payload.challenges.filter(
          (challenge) =>
            !Array.isArray(challenge.completed_user_ids) ||
            !challenge.completed_user_ids.includes(payload.userId!)
        );

      case "addUser":
        // Ensure challengeId and userId are provided
        if (!payload?.challengeId || !payload.userId) {
          throw new Error("ChallengeId and userId are required to add a user.");
        }
        // Reference the specific challenge document by its ID
        const challengeDocRef = doc(db, "challenges", payload.challengeId);
        // Fetch the document data
        const challengeDoc = await getDoc(challengeDocRef);

        if (challengeDoc.exists()) {
          // Update the document to add the user ID to the completed_user_ids array
          await updateDoc(challengeDocRef, {
            completed_user_ids: arrayUnion(payload.userId),
          });
          // Return the updated document data
          return {
            id: payload.challengeId,
            ...challengeDoc.data(),
          } as Challenge;
        } else {
          throw new Error("Challenge not found.");
        }

      case "create":
        // Ensure challengeData is provided
        if (!payload?.challengeData) {
          throw new Error(
            "Challenge data is required to create a new challenge."
          );
        }
        // Create a new challenge object
        const newChallenge = {
          title: payload.challengeData.title,
          description: payload.challengeData.description,
          method: payload.challengeData.method,
          tokens: payload.challengeData.tokens,
          created_at: new Date().toISOString(),
          completed_user_ids: [], // Initialize as an empty array
        };

        // Add the new challenge document to the "challenges" collection
        const docRef = await addDoc(collection(db, "challenges"), newChallenge);
        // Return the created challenge with its Firestore ID
        return { id: docRef.id, ...newChallenge } as Challenge;

      default:
        // Throw an error if the action is invalid
        throw new Error("Invalid action.");
    }
  } catch (error) {
    // Log the error and return null to indicate failure
    console.error(`Error in manageChallenges (${action}):`, error);
    return null;
  }
};

/**
 * Checks a specific challenge based on the given method.
 *
 * @param method
 * @returns 'complete' if the challenge is completed, otherwise 'incomplete'.
 */
export async function checkChallenge(
  userId: string,
  method:
    | "checkDailyInvitationStreak"
    | "checkDoubleReferralStreak"
    | "trackTwelveHourInvitations"
    | "countWeeklyInvites"
    | "countNightTimeInvites"
    | "countWeekendInvites"
    | "checkWeekLongStreak"
    | "countHourlySprintInvites"
    | "countDailyInvites"
): Promise<"complete" | "incomplete"> {
  // Fetch friend lists from Firestore
  const q = query(collection(db, "friends"), where("user_id", "==", userId));
  const querySnapshot = await getDocs(q);

  const friendLists: Record<string, string> = {};
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.friend_id && data.created_at) {
      friendLists[data.friend_id] = data.created_at;
    }
  });

  // Helper function to parse dates consistently
  const parseDate = (dateStr: string) => new Date(dateStr);

  // Helper to group invites by day
  const groupInvitesByDay = (
    friendLists: Record<string, string>
  ): Record<string, number> => {
    const grouped: Record<string, number> = {};
    Object.values(friendLists).forEach((dateStr) => {
      const date = parseDate(dateStr);
      const dayKey = date.toDateString();
      grouped[dayKey] = (grouped[dayKey] || 0) + 1;
    });
    return grouped;
  };

  switch (method) {
    // Check 5-day streak of at least 1 invitation per day
    case "checkDailyInvitationStreak": {
      const dailyInvites = groupInvitesByDay(friendLists);
      let currentStreak = 0;
      let maxStreak = 0;

      const days = Object.keys(dailyInvites).sort();
      for (let i = 0; i < days.length; i++) {
        if (dailyInvites[days[i]] >= 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      return maxStreak >= 5 ? "complete" : "incomplete";
    }

    // Check 3-day streak of at least 2 referrals per day
    case "checkDoubleReferralStreak": {
      const dailyInvites = groupInvitesByDay(friendLists);
      let currentStreak = 0;
      let maxStreak = 0;

      const days = Object.keys(dailyInvites).sort();
      for (let i = 0; i < days.length; i++) {
        if (dailyInvites[days[i]] >= 2) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      return maxStreak >= 3 ? "complete" : "incomplete";
    }

    // Track invitations over 12 hours
    case "trackTwelveHourInvitations": {
      const targetCount = 5;

      const now = new Date();
      const twelveHoursAgo = new Date(now.getTime() - 12 * 60 * 60 * 1000);

      const invitesInWindow = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        return inviteDate >= twelveHoursAgo && inviteDate <= now;
      }).length;

      return invitesInWindow >= targetCount ? "complete" : "incomplete";
    }

    // Count invites within a week
    case "countWeeklyInvites": {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const weeklyInvites = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        return inviteDate >= weekAgo && inviteDate <= now;
      }).length;

      return weeklyInvites >= 50 ? "complete" : "incomplete";
    }

    // Count night time invites (midnight to 6 AM)
    case "countNightTimeInvites": {
      const nightTimeInvites = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        const hour = inviteDate.getHours();
        return hour >= 0 && hour < 6;
      }).length;

      return nightTimeInvites >= 3 ? "complete" : "incomplete";
    }

    // Count weekend invites
    case "countWeekendInvites": {
      const weekendInvites = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        const day = inviteDate.getDay();
        return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
      }).length;

      return weekendInvites >= 5 ? "complete" : "incomplete";
    }

    // Check week-long streak
    case "checkWeekLongStreak": {
      const dailyInvites = groupInvitesByDay(friendLists);
      let currentStreak = 0;
      let maxStreak = 0;

      const days = Object.keys(dailyInvites).sort();
      for (let i = 0; i < days.length; i++) {
        if (dailyInvites[days[i]] >= 1) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }

      return maxStreak >= 7 ? "complete" : "incomplete";
    }

    // Count hourly sprint invites
    case "countHourlySprintInvites": {
      const now = new Date();
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      const hourlyInvites = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        return inviteDate >= hourAgo && inviteDate <= now;
      }).length;

      return hourlyInvites >= 5 ? "complete" : "incomplete";
    }

    // Count daily invites
    case "countDailyInvites": {
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const dailyInvites = Object.values(friendLists).filter((dateStr) => {
        const inviteDate = parseDate(dateStr);
        return inviteDate >= dayAgo && inviteDate <= now;
      }).length;

      return dailyInvites >= 10 ? "complete" : "incomplete";
    }

    default:
      return "incomplete";
  }
}

/**
 * Handles user friend relationships in the database.
 * @param params - Object with operation details:
 *   - action: "lists" | "get" | "filter" | "create" | "claim"
 *   - userId: User ID (required for list, create, claim)
 *   - friendId: Friend ID (required for get, create, claim)
 *   - friends: Friend[] (required for filter)
 *   - airtime, data: Optional values for new friend
 * @returns Promise<Friend[] | Friend | User | null>
 */
export async function manageUserFriends(
  params:
    | { action: "lists"; userId: string }
    | { action: "get"; friendId: string }
    | { action: "filter"; friends: Friend[] }
    | {
        action: "create";
        userId: string;
        friendId: string;
        airtime: number | null;
        data: string | null;
        tokens: number | null;
      }
    | { action: "claim"; userId: string; friendId: string }
): Promise<Friend[] | Friend | User | null> {
  try {
    switch (params.action) {
      case "lists": {
        // Get all friends for a user
        const friendsRef = collection(db, "friends");
        const q = query(friendsRef, where("user_id", "==", params.userId));

        return new Promise<Friend[]>((resolve) => {
          onSnapshot(q, (querySnapshot) => {
            const friends = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            })) as Friend[];
            resolve(friends);
          });

          // Optional: Return the unsubscribe function if needed for cleanup
        });
      }

      case "filter":
        // Filter out claimed friends
        return params.friends.filter((friend: Friend) => !friend.is_claimed);

      case "get": {
        // Get friend by ID from users collection
        const friendDocRef = doc(db, "users", params.friendId);
        const friendDocSnap = await getDoc(friendDocRef);
        return friendDocSnap.exists() ? (friendDocSnap.data() as User) : null;
      }

      case "create": {
        const newFriendData = {
          user_id: params.userId,
          friend_id: params.friendId,
          airtime: params.airtime ?? null,
          data: params.data ?? null,
          tokens: params.tokens ?? null,
          is_claimed: false,
          created_at: new Date().toISOString(),
        };

        const docRef = await addDoc(collection(db, "friends"), newFriendData);
        return { id: docRef.id, ...newFriendData } as Friend;
      }

      case "claim": {
        // Get all friends for a user
        const friendsRef = collection(db, "friends");
        const q = query(
          friendsRef,
          where("user_id", "==", params.userId),
          where("friend_id", "==", params.friendId)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          throw new Error("Friend not found");
        }

        const friendDoc = querySnapshot.docs[0]; // Assuming there's only one match
        const friendRef = doc(db, "friends", friendDoc.id);

        await updateDoc(friendRef, { is_claimed: true });

        return {
          id: friendDoc.id,
          ...friendDoc.data(),
          is_claimed: true,
        } as Friend;
      }

      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error(`Error performing ${params.action}:`, error);
    throw error;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pushToLocalStorage(key: string, value: any): void {
  // Retrieve existing data from localStorage
  const data = JSON.parse(localStorage.getItem(key) || "[]");

  // Ensure it's an array
  if (!Array.isArray(data)) {
    console.warn(`Invalid data found in localStorage for key: ${key}`);
    return;
  }

  // Add new value to the beginning of the array
  data.unshift(value);

  // Limit array length to 10
  if (data.length > 10) {
    data.pop();
  }

  // Store back in localStorage
  localStorage.setItem(key, JSON.stringify(data));
}

export function getFormattedDate(): string {
  const date: Date = new Date();
  const day: number = date.getDate();
  const month: string = date.toLocaleString('en-US', { month: 'long' });
  
  return `${day} ${month}`;
}
