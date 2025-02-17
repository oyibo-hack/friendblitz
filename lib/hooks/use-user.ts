import { useEffect, useState } from "react";
import {
  caesarCipher,
  type Friend,
  manageUserFriends,
  type User,
} from "../utils";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/app/firebase";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

export interface CurrentUserReturn {
  mode: "current";
  user: User | null;
  friends: Friend[];
  loading: boolean;
  error: string | null;
  users?: never;
}

export interface AllUsersReturn {
  mode: "all";
  users: User[];
  loading: boolean;
  error: string | null;
  user?: never;
  friends?: never;
}

type UseUserReturn = CurrentUserReturn | AllUsersReturn;

/**
 * Custom hook to fetch the current user or all users from Firestore.
 * Supports real-time updates for the current user's data.
 */
export const useUser = (
  mode: "current" | "all" = "current" // Default to fetching the current user
): UseUserReturn => {
  const [user, setUser] = useState<User | null>(null); // Current user's data
  const [friends, setFriends] = useState<Friend[]>([]); // Current user's friends
  const [users, setUsers] = useState<User[]>([]); // All users' data
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const router = useRouter();

  useEffect(() => {
    let unsubscribe: (() => void) | null = null; // For real-time updates

    const fetchUser = async () => {
      try {
        if (mode === "current") {
          // Handle fetching current user data
          onAuthStateChanged(auth, async (authUser) => {
            if (!authUser) {
              setLoading(false);
              router.push("/join"); // Redirect to join if not authenticated
              return;
            }

            // Reference to the user document
            const userRef = doc(db, "users", authUser.uid);

            // Set up real-time updates for the user document
            unsubscribe = onSnapshot(userRef, (docSnap) => {
              if (docSnap.exists()) {
                const updated = docSnap.data();
                setUser({
                  id: authUser.uid,
                  username: updated.username,
                  tokens: updated.tokens,
                  email: updated.email,
                  phone_number: caesarCipher(
                    updated.phone_number,
                    Number(process.env.NEXT_PUBLIC_CIPHER_SHIFT!),
                    "decode",
                    true
                  ), // Decode the user's phone number using a Caesar cipher
                  created_at: updated.created_at,
                });
              } else {
                setUser(null);
                router.push("/join");
              }
            });

            // Fetch user's friends
            const friendsList = (await manageUserFriends({
              action: "lists",
              userId: authUser.uid,
            })) as Friend[];

            if (friendsList) setFriends(friendsList);
          });
        } else if (mode === "all") {
          // Handle fetching all users
          const usersQuery = query(
            collection(db, "users"),
            orderBy("username")
          );
          const usersSnap = await getDocs(usersQuery);

          const users = usersSnap.docs.map((doc) => {
            const data = doc.data();
            return {
              id: data.uid,
              username: data.username,
              tokens: data.tokens,
              email: data.email,
              phone_number: caesarCipher(
                data.phone_number,
                Number(process.env.NEXT_PUBLIC_CIPHER_SHIFT!),
                "decode",
                true
              ), // Decode the user's phone number using a Caesar cipher
              created_at: data.created_at,
            };
          });

          setUsers(users); // Update the state with the list of users
        }
      } catch (err) {
        // Handle errors
        setError(err instanceof Error ? err.message : "Error fetching data.");
      } finally {
        setLoading(false); // Stop loading
      }
    };

    fetchUser(); // Initialize data fetching

    return () => {
      if (unsubscribe) unsubscribe(); // Clean up real-time updates
    };
  }, [mode, router]);

  // Return the appropriate state based on the mode
  return mode === "current"
    ? { mode, user, friends, loading, error }
    : { mode, users, loading, error };
};
