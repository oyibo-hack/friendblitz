/* eslint-disable @next/next/no-img-element */
"use client";
import { useUser } from "@/lib/hooks/use-user";
import styles from "../page.module.css";
import { useEffect, useRef, useState } from "react";
import {
  caesarCipher,
  fraudDetection,
  getDeviceInfo,
  getMNO,
  getScreenResolution,
  getUserLocation,
  getVTUReward,
  isDarkModeEnabled,
  manageUserFriends,
  mergeUsername,
  numberFormatter,
  VTUService,
  type User,
} from "@/lib/utils";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";

import userList from "@/nameList.json";

const PaystackButton = dynamic(() => import("@/components/paystack-button"), {
  ssr: false,
});

export default function Page() {
  const { users } = useUser("all");

  const formRef = useRef<HTMLFormElement | null>(null); // Create a reference for the form

  const [isLoginView, setIsLoginView] = useState(true);

  const [emailInput, setEmailInput] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Toggle password visibility

  const [isAgreed, setIsAgreed] = useState<boolean>(false);

  const [modalVisible, setModalVisible] = useState(false); // Toggle modal visibility

  const [isRegisterLoading, setIsRegisterLoading] = useState(false); // Loading state

  const [isLoginLoading, setLoginLoading] = useState(false); // Loading state

  const [friend, setFriend] = useState<User | null>(null);

  const router = useRouter();

  const ENABLE_PAYMENT = process.env.NEXT_PUBLIC_ENABLE_PAYMENT === "true";

  // Effect to handle friend referral from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("friend")) {
      setIsLoginView(false); // Switch to registration view
    }
  }, []);

  // Effect to find and set referred friend's details
  useEffect(() => {
    if (users) {
      const searchParams = new URLSearchParams(location.search);
      const friendUsername = searchParams.get("friend") || "";

      // Normalize and find friend username
      const normalizedFriendUsername = friendUsername
        .replace(/[^a-zA-Z]/g, " ")
        .split(" ")
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");

      // Find friend in users list
      const matchedFriend = users.find(
        (user) => user.username === normalizedFriendUsername
      );

      if (matchedFriend) {
        setFriend(matchedFriend);
        toast.info(`You are invited by ${matchedFriend.username}`, {
          duration: 30000, // 30 seconds
        });
      }
    }
  }, [users]);

  const checkPasswordStrength = (password: string) => {
    if (password.length < 6)
      throw new Error("Password is weak: Must be at least 6 characters.");
    if (!/[A-Z]/.test(password))
      throw new Error("Password is weak: Add an uppercase letter.");
    if (!/[0-9]/.test(password))
      throw new Error("Password is weak: Add a number.");
    if (!/[!@#$%^&*]/.test(password))
      throw new Error("Password is weak: Add a special character.");
  };

  // User registration handler
  const register = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsRegisterLoading(true);

    const form = event.currentTarget;
    const email = (
      form.elements.namedItem("register-email") as HTMLInputElement
    ).value;
    const registerPhone = (
      form.elements.namedItem("register-phone") as HTMLInputElement
    ).value;
    const password = (
      form.elements.namedItem("register-pass") as HTMLInputElement
    ).value;

    if (![email, registerPhone, password].every(Boolean)) {
      toast.info("Please fill in all fields.");
      return;
    }

    try {
      // 🚨 Check if email is blacklisted
      const blacklistedEmails = await fraudDetection("getBlacklistedEmails");
      if (blacklistedEmails.includes(email)) {
        toast.error("This email has been flagged");
        setIsRegisterLoading(false);
        return;
      }

      const phoneNumber = new numberFormatter(registerPhone, "+234");

      const mno = getMNO(phoneNumber.withoutPrefix());
      const isKnownMNO = mno !== "Unknown";

      if (!isKnownMNO) {
        toast.error("The entered number is invalid.");
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      // Check for existing user with same phone number
      const existingUser = users?.find(
        (user) => user.phone_number === phoneNumber.withoutPrefix()
      );

      if (existingUser) {
        toast.error(
          `A user with phone number ${phoneNumber} is already registered.`
        );
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      // Get User's IP Address & Device Info
      const { country: userCountry, ip: userIP } = await getUserLocation();
      const {
        os: deviceOS,
        browser: deviceBrowser,
        deviceModel,
      } = getDeviceInfo();
      const deviceFingerprint = `${deviceOS}-${deviceBrowser}-${deviceModel}`;

      // ! Warning 🚨 Fraud Check: Limit registrations from the same IP (More than 2 is flagged)
      const usersWithSameIP = await getDocs(
        query(collection(db, "users"), where("ip_address", "==", userIP))
      );
      if (usersWithSameIP.size >= 2) {
        await fraudDetection("addEmailToBlacklist", email);
        toast.error("An unexpected error occurred.");
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      // ! Warning 🚨 Fraud Check: Prevent multiple registrations from the same device
      const usersWithSameDevice = await getDocs(
        query(
          collection(db, "users"),
          where("device_info.fingerprint", "==", deviceFingerprint)
        )
      );
      if (usersWithSameDevice.size >= 2) {
        await fraudDetection("addEmailToBlacklist", email);
        toast.error("An unexpected error occurred.");
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      // ! Warning 🚨 Fraud Check: Blacklist check for email (Using a basic regex for disposable emails)
      const disposableEmailDomains = [
        "tempmail.com",
        "10minutemail.com",
        "mailinator.com",
      ];
      const emailDomain = email.split("@")[1];
      if (disposableEmailDomains.includes(emailDomain)) {
        await fraudDetection("addEmailToBlacklist", email);
        toast.error("Please use a valid email address.");
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      // ! Warning 🚨 Fraud Check: Rate limiting (Preventing too many signups in short time)
      const lastSignup = localStorage.getItem("lastSignupTime");
      if (lastSignup && Date.now() - Number(lastSignup) < 60000) {
        await fraudDetection("addEmailToBlacklist", email);
        toast.error(
          "Too many registration attempts. Please wait and try again."
        );
        setIsRegisterLoading(false);
        setModalVisible(false);
        return;
      }

      localStorage.setItem("lastSignupTime", String(Date.now()));

      // Instantiate VTU services
      const vtuService = new VTUService();

      // Check if the system balance is sufficient for the transaction
      const isValid = await vtuService.isBalanceValidForUse();
      if (!isValid) {
        throw new Error(
          "The system is under too much load. Please try again later."
        );
      }

      checkPasswordStrength(password);

      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const darkMode = isDarkModeEnabled();
      const screenResolution = getScreenResolution();

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), {
        isBlocked: false,
        fraudDetected: false,
        country: userCountry, // 🌍 User's country
        device_info: {
          os: deviceOS,
          browser: deviceBrowser,
          model: deviceModel,
          fingerprint: deviceFingerprint,
          screen_resolution: screenResolution,
          is_mobile: /Mobi|Android/i.test(navigator.userAgent),
        },
        isNewUser: {
          isClaimed: false, // Boolean property to track if bundle code is claimed
          bundleCode: getVTUReward(mno, "data"),
          date: new Date().toISOString(),
        },
        ip_address: userIP,
        id: user.uid,
        username: mergeUsername(
          userList,
          users?.flatMap((user) => user.username) ?? []
        )[0],
        tokens: 0,
        total_tokens: 0,
        email,
        mno: getMNO(phoneNumber.withoutPrefix()),
        phone_number: caesarCipher(
          phoneNumber.withoutPrefix(),
          Number(process.env.NEXT_PUBLIC_CIPHER_SHIFT!),
          "encode",
          true
        ),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        is_dark_mode: darkMode,
        user_agent: navigator.userAgent,
        last_login: new Date().toISOString(),
        login_method: user.providerData[0].providerId,
        referrer: document.referrer,
        created_at: new Date().toISOString(),
      });

      // Handle friend referral reward
      if (friend) {
        const friendMNO = getMNO(friend.phone_number);
        if (friendMNO !== "Unknown") {
          // Randomly select one of the three reward types
          const rewardOptions: Array<"airtime" | "data" | "tokens"> = [
            "data",
            "airtime",
            "tokens",
          ];
          const rewardType =
            rewardOptions[Math.floor(Math.random() * rewardOptions.length)];

          // Get reward amount (only call getVTUReward for data/airtime)
          const amount =
            rewardType === "tokens"
              ? 50
              : getVTUReward(friendMNO, rewardType as "airtime" | "data");

          // Structuring reward data to ensure only one property is assigned
          const rewardData = {
            data: rewardType === "data" ? String(amount) : null,
            airtime: rewardType === "airtime" ? Number(amount) : null,
            tokens: rewardType === "tokens" ? 50 : null,
          };

          // Create friend record in the database
          await manageUserFriends({
            action: "create",
            friendId: user.uid,
            userId: friend.id,
            airtime: rewardData.airtime,
            data: rewardData.data,
            tokens: rewardData.tokens,
          });
        }
      }

      localStorage.setItem(
        "guideUser",
        JSON.stringify({
          id: user.uid,
        })
      );

      router.push("/my-profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
      setModalVisible(false);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // User login handler
  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginLoading(true);

    const form = event.currentTarget;
    const username = (
      form.elements.namedItem("login-username") as HTMLInputElement
    ).value;
    const password = (form.elements.namedItem("login-pass") as HTMLInputElement)
      .value;

    // Normalize username for lookup
    const normalizedUsername = username
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

    const userDetails = users?.find(
      (user) => user.username === normalizedUsername
    );

    if (!userDetails) {
      toast.error("User not found");
      setLoginLoading(false);
      return;
    }

    try {
      // 🚨 Fraud Check: Rate limiting (Preventing too many login attempts)
      const lastLoginAttempt = localStorage.getItem("lastLoginTime");

      if (lastLoginAttempt && Date.now() - Number(lastLoginAttempt) < 60000) {
        toast.error("Too many login attempts. Please wait and try again.");
        return;
      }

      localStorage.setItem("lastLoginTime", String(Date.now()));

      // Attempt to sign in with email from user details
      await signInWithEmailAndPassword(auth, userDetails.email, password);

      // Successful login
      router.push("/my-profile");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error));
    } finally {
      setLoginLoading(false);
    }
  };

  // Handles password reset for users.
  const forgetPassword = async () => {
    // Prompt user to enter their registered email
    const email = prompt("Enter your registered email for password reset:");

    // If no email is entered, show an error message
    if (!email) {
      toast.error("Email is required to reset password.");
      return;
    }

    try {
      // Send password reset email using Firebase Auth
      await sendPasswordResetEmail(auth, email);

      // Notify user to check their inbox for the reset link
      toast.success("Password reset link sent! Check your inbox.");
    } catch (error) {
      // Handle and display any errors that occur
      toast.error(
        error instanceof Error ? error.message : "Something went wrong!"
      );
    }
  };

  return (
    <div className={styles.login}>
      <img src="/home-bg.svg" alt="login image" className={styles.login__img} />
      {isLoginView ? (
        <form onSubmit={login} className={styles.login__form}>
          <h1 className={styles.login__title}>Log in to your account.</h1>
          <div className={styles.login__content}>
            <div className={styles.login__box}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.login__icon}
              >
                <path d="M20 22H18V20C18 18.3431 16.6569 17 15 17H9C7.34315 17 6 18.3431 6 20V22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13ZM12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" />
              </svg>

              <div className={styles.login__boxInput}>
                <input
                  type="text"
                  required
                  className={styles.login__input}
                  id="login-username"
                  placeholder=" "
                />
                <label htmlFor="login-username" className={styles.login__label}>
                  Your Username
                </label>
              </div>
            </div>
            <div className={styles.login__box}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.login__icon}
              >
                <path d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6ZM19 10H5V20H19V10ZM11 15.7324C10.4022 15.3866 10 14.7403 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V18H11V15.7324ZM8 8H16V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8Z" />
              </svg>
              <div className={styles.login__boxInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={styles.login__input}
                  id="login-pass"
                  placeholder=" "
                />
                <label htmlFor="login-pass" className={styles.login__label}>
                  Your Password
                </label>

                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.login__eye}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.login__eye}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className={styles.login__check}>
            <div className={styles.login__checkGroup}>
              <input
                type="checkbox"
                className={styles.login__checkInput}
                id="login-check"
              />
              <label htmlFor="login-check" className={styles.login__checkLabel}>
                Remember me
              </label>
            </div>
            <p onClick={forgetPassword} className={styles.login__forgot}>
              Forgot Password?
            </p>
          </div>
          <button
            type="submit"
            className={`${styles.login__button} ${styles.button} ${styles.button__yellow}`}
          >
            {isLoginLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            Login
          </button>
          <p className={styles.login__register}>
            Don&apos;t have an account?{" "}
            <span onClick={() => setIsLoginView(!isLoginView)}>Register</span>
          </p>
        </form>
      ) : (
        <form ref={formRef} onSubmit={register} className={styles.login__form}>
          <h1 className={styles.login__title}>Create new account.</h1>
          <div className={styles.login__content}>
            {friend && (
              <div className={styles.login__box}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.login__icon}
                >
                  <path d="M14 14.252V16.3414C13.3744 16.1203 12.7013 16 12 16C8.68629 16 6 18.6863 6 22H4C4 17.5817 7.58172 14 12 14C12.6906 14 13.3608 14.0875 14 14.252ZM12 13C8.685 13 6 10.315 6 7C6 3.685 8.685 1 12 1C15.315 1 18 3.685 18 7C18 10.315 15.315 13 12 13ZM12 11C14.21 11 16 9.21 16 7C16 4.79 14.21 3 12 3C9.79 3 8 4.79 8 7C8 9.21 9.79 11 12 11ZM18 17V14H20V17H23V19H20V22H18V19H15V17H18Z" />
                </svg>

                <div className={styles.login__boxInput}>
                  <input
                    type="text"
                    className={styles.login__input}
                    id="invite"
                    placeholder=" "
                    defaultValue={friend?.username}
                    readOnly
                  />

                  <label htmlFor="invite" className={styles.login__label}>
                    Your Friend
                  </label>
                </div>
              </div>
            )}
            <div className={styles.login__box} id="phone-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.login__icon}
              >
                <path d="M9.36556 10.6821C10.302 12.3288 11.6712 13.698 13.3179 14.6344L14.2024 13.3961C14.4965 12.9845 15.0516 12.8573 15.4956 13.0998C16.9024 13.8683 18.4571 14.3353 20.0789 14.4637C20.599 14.5049 21 14.9389 21 15.4606V19.9234C21 20.4361 20.6122 20.8657 20.1022 20.9181C19.5723 20.9726 19.0377 21 18.5 21C9.93959 21 3 14.0604 3 5.5C3 4.96227 3.02742 4.42771 3.08189 3.89776C3.1343 3.38775 3.56394 3 4.07665 3H8.53942C9.0611 3 9.49513 3.40104 9.5363 3.92109C9.66467 5.54288 10.1317 7.09764 10.9002 8.50444C11.1427 8.9484 11.0155 9.50354 10.6039 9.79757L9.36556 10.6821ZM6.84425 10.0252L8.7442 8.66809C8.20547 7.50514 7.83628 6.27183 7.64727 5H5.00907C5.00303 5.16632 5 5.333 5 5.5C5 12.9558 11.0442 19 18.5 19C18.667 19 18.8337 18.997 19 18.9909V16.3527C17.7282 16.1637 16.4949 15.7945 15.3319 15.2558L13.9748 17.1558C13.4258 16.9425 12.8956 16.6915 12.3874 16.4061L12.3293 16.373C10.3697 15.2587 8.74134 13.6303 7.627 11.6707L7.59394 11.6126C7.30849 11.1044 7.05754 10.5742 6.84425 10.0252Z" />
              </svg>

              <div className={styles.login__boxInput}>
                <input
                  type="tel"
                  required
                  className={styles.login__input}
                  id="register-phone"
                  placeholder=" "
                  maxLength={11} // Ensures no more than 11 digits
                  pattern="[0-9]{11}" // Ensures only 11 digits are entered
                  onChange={(e) => {
                    const value = e.target.value.trim(); // Trim to remove any accidental spaces

                    // Ensure the value contains only numbers
                    if (!/^\d+$/.test(value)) {
                      document.getElementById("phone-box")!.style.borderColor =
                        "red";
                      return;
                    }

                    // If less than 11 digits or invalid MNO, show error
                    if (value.length < 11 || !getMNO(value)) {
                      document.getElementById("phone-box")!.style.borderColor =
                        "red";
                    } else {
                      document.getElementById("phone-box")!.style.borderColor =
                        ""; // Reset border
                    }
                  }}
                />

                <label htmlFor="register-phone" className={styles.login__label}>
                  Your Phone Number
                </label>
              </div>
            </div>
            <div className={styles.login__box}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.login__icon}
              >
                <path d="M20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C13.6418 20 15.1681 19.5054 16.4381 18.6571L17.5476 20.3214C15.9602 21.3818 14.0523 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12V13.5C22 15.433 20.433 17 18.5 17C17.2958 17 16.2336 16.3918 15.6038 15.4659C14.6942 16.4115 13.4158 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C13.1258 7 14.1647 7.37209 15.0005 8H17V13.5C17 14.3284 17.6716 15 18.5 15C19.3284 15 20 14.3284 20 13.5V12ZM12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9Z" />
              </svg>

              <div className={styles.login__boxInput}>
                <input
                  type="email"
                  required
                  className={styles.login__input}
                  id="register-email"
                  placeholder=" "
                  // value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                  }}
                />
                <label htmlFor="register-email" className={styles.login__label}>
                  Your Email
                </label>
              </div>
            </div>
            <div className={styles.login__box}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.login__icon}
              >
                <path d="M6 8V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6ZM19 10H5V20H19V10ZM11 15.7324C10.4022 15.3866 10 14.7403 10 14C10 12.8954 10.8954 12 12 12C13.1046 12 14 12.8954 14 14C14 14.7403 13.5978 15.3866 13 15.7324V18H11V15.7324ZM8 8H16V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8Z" />
              </svg>
              <div className={styles.login__boxInput}>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  className={styles.login__input}
                  id="register-pass"
                  placeholder=" "
                />
                <label htmlFor="register-pass" className={styles.login__label}>
                  Your Password
                </label>

                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.login__eye}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <path d="M12.0003 3C17.3924 3 21.8784 6.87976 22.8189 12C21.8784 17.1202 17.3924 21 12.0003 21C6.60812 21 2.12215 17.1202 1.18164 12C2.12215 6.87976 6.60812 3 12.0003 3ZM12.0003 19C16.2359 19 19.8603 16.052 20.7777 12C19.8603 7.94803 16.2359 5 12.0003 5C7.7646 5 4.14022 7.94803 3.22278 12C4.14022 16.052 7.7646 19 12.0003 19ZM12.0003 16.5C9.51498 16.5 7.50026 14.4853 7.50026 12C7.50026 9.51472 9.51498 7.5 12.0003 7.5C14.4855 7.5 16.5003 9.51472 16.5003 12C16.5003 14.4853 14.4855 16.5 12.0003 16.5ZM12.0003 14.5C13.381 14.5 14.5003 13.3807 14.5003 12C14.5003 10.6193 13.381 9.5 12.0003 9.5C10.6196 9.5 9.50026 10.6193 9.50026 12C9.50026 13.3807 10.6196 14.5 12.0003 14.5Z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className={styles.login__eye}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z" />
                  </svg>
                )}
              </div>
            </div>
          </div>
          <div className={styles.login__check}>
            <div className={styles.login__checkGroup}>
              <input
                type="checkbox"
                className={styles.login__checkInput}
                defaultChecked={isAgreed}
                // checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
                id="register-check"
              />
              <label
                htmlFor="register-check"
                className={styles.login__checkLabel}
              >
                I agree to the <a href="/rules">rules</a> and{" "}
                <a href="/privacy-policy">privacy policy</a>.
              </label>
            </div>
          </div>
          <button
            type="button"
            className={`${styles.login__button} ${styles.button} ${styles.button__yellow}`}
            onClick={() => setModalVisible(true)}
            disabled={!isAgreed || !emailInput}
          >
            {isRegisterLoading && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={24}
                height={24}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            )}
            Create account
          </button>
          <p className={styles.login__register}>
            Already have an account?{" "}
            <span onClick={() => setIsLoginView(!isLoginView)}>Log In</span>
          </p>
        </form>
      )}

      <div className={`modal ${modalVisible ? "activeModal" : ""}`}>
        <div className="modal__container">
          <article className={styles.block__card}>
            <img src="/image.png" alt="image" className={styles.block__img} />

            {ENABLE_PAYMENT ? (
              <h3 className={styles.block__title}>
                Get a membership for ₦2100.
              </h3>
            ) : (
              <h3 className={styles.block__title}>
                Get a membership for free!
              </h3>
            )}
            {ENABLE_PAYMENT ? (
              <PaystackButton
                className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
                email={emailInput}
                onSuccess={() => {
                  formRef.current?.requestSubmit();
                }}
                onClose={() => alert("Complete the payment before leaving!")}
              >
                {isRegisterLoading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width={24}
                  >
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                )}
              </PaystackButton>
            ) : (
              <button
                type="button"
                className={`${styles.button} ${styles.button__yellow} ${styles.block__button}`}
                onClick={() => {
                  formRef.current?.requestSubmit();
                }}
              >
                {isRegisterLoading ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="animate-spin"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    width={24}
                  >
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                )}
              </button>
            )}
          </article>
        </div>
      </div>
    </div>
  );
}
