"use client";
import styles from "../app/page.module.css";
import { useEffect } from "react";

function ScrollUp() {
  useEffect(() => {
    // Function to handle scroll behavior
    const scrollUp = () => {
      const scrollUpButton = document.getElementById("scroll-up");
      if (!scrollUpButton) return;

      if (window.scrollY >= 350) {
        scrollUpButton.classList.add(styles.showScroll);
      } else {
        scrollUpButton.classList.remove(styles.showScroll);
      }
    };

    // Add scroll event listener
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", scrollUp);
    }

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("scroll", scrollUp);
    };
  }, []);

  return (
    <a href="#" className={styles.scrollUp} id="scroll-up">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M13.0001 7.82843V20H11.0001V7.82843L5.63614 13.1924L4.22192 11.7782L12.0001 4L19.7783 11.7782L18.3641 13.1924L13.0001 7.82843Z"></path>
      </svg>
    </a>
  );
}

export default ScrollUp;
