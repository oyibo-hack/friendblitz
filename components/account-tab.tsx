"use client";

import { auth, db } from "@/lib/firebase";
import { type User } from "@/lib/utils";
import { sendPasswordResetEmail } from "firebase/auth";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";

const AccountTab = ({ user }: { user: User }) => {
  const router = useRouter();

  const [notifications, setNotifications] = useState<Record<string, boolean>>({
    email_notif: true,
    referral_notif: true,
    puzzle_notif: true,
  });

  useEffect(() => {
    const savedNotifs = JSON.parse(
      localStorage.getItem("notifications") || "{}"
    );

    setNotifications({
      email_notif: savedNotifs.email_notif ?? true,
      referral_notif: savedNotifs.referral_notif ?? true,
      puzzle_notif: savedNotifs.puzzle_notif ?? true,
    });
  }, []);

  // Handle input changes

  // Handle notification changes
  const notificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    const updatedNotifs = { ...notifications, [id]: checked };

    setNotifications(updatedNotifs);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifs));
  };

  // Update Profile in Firebase
  const updateProfile = async () => {};

  // Send Password Reset Email
  const changePassword = async () => {
    if (!user) throw new Error("User not authenticated");

    try {
      await sendPasswordResetEmail(auth, user.email);
      toast.message("Password reset email sent.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email.");
    }
  };

  // Delete account function
  async function deleteAccount() {
    if (!user) return;

    const confirmation = prompt('Type "delete my account" to confirm:');

    // Validate user input to prevent accidental account deletion
    if (confirmation && confirmation.trim() === "delete my account") {
      try {
        // Delete the user document from Firestore
        const userDocRef = doc(db, "users", user.id);
        await deleteDoc(userDocRef);

        toast.success("Your account has been deleted successfully");

        // Calls logOut to clean up session after account deletion
        await logOut();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : String(error));
      }
    }
  }

  // Sign out function
  async function logOut() {
    try {
      await auth.signOut(); // Signs out the current user
      router.push("/"); // Redirect to home page
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    }
  }

  // Download User Data as JSON
  const downloadData = async () => {
    try {
      if (!user) throw new Error("User not authenticated");

      const userRef = doc(db, "users", user.id);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const jsonBlob = new Blob([JSON.stringify(userData, null, 2)], {
          type: "application/json",
        });

        const url = URL.createObjectURL(jsonBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "user_data.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      console.error("Error downloading data:", error);
      alert("Failed to download data.");
    }
  };

  return (
    <div className="bg-gray-800 text-gray-200 rounded-lg p-6 shadow-md">
      <h3 className="text-3xl font-bold mb-4">Manage Account</h3>

      {/* Profile Information */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Profile Information</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Username
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user.username}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user.email}
              // onChange={handleChange}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-700 text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={user.phone_number}
              // onChange={handleChange}
              readOnly
            />
          </div>
          <button
            onClick={() => updateProfile()}
            className="cursor-not-allowed bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-500 transition"
          >
            Update Profile
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="mb-6">
        <h4 className="font-bold mb-3">Notification Settings</h4>
        <div className="space-y-2">
          {[
            { id: "email_notif", label: "Email notifications", checked: true },
            { id: "referral_notif", label: "Referral updates", checked: true },
            {
              id: "puzzle_notif",
              label: "Daily puzzle reminders",
              checked: true,
            },
          ].map((notif) => (
            <div key={notif.id} className="flex items-center">
              <input
                type="checkbox"
                id={notif.id}
                className="h-4 w-4 text-blue-500 bg-gray-700 border-gray-600 rounded"
                checked={notifications[notif.id] ?? false}
                onChange={notificationChange}
              />
              <label htmlFor={notif.id} className="ml-2">
                {notif.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Account Actions */}
      <div>
        <h4 className="font-bold mb-3">Account Actions</h4>
        <div className="space-y-2">
          <button
            onClick={changePassword}
            className="cursor-pointer w-full py-2 px-4 border border-gray-600 rounded-md bg-gray-700 hover:bg-gray-600 text-left transition"
          >
            Change Password
          </button>
          <button
            onClick={downloadData}
            className="cursor-pointer w-full py-2 px-4 border border-gray-600 rounded-md bg-gray-700 hover:bg-gray-600 text-left transition"
          >
            Download Your Data
          </button>
          
          <button
            type="button"
            onClick={logOut}
            className="cursor-pointer w-full focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Log Out
          </button>
          <button
            type="button"
            onClick={deleteAccount}
            className="cursor-pointer w-full focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountTab;
