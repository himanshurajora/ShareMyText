import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import "./App.css";
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import * as Crypto from "crypto-js";
import {
  encryptData,
  decryptData,
  generateKeyPair,
  exportPublicKey,
  importPublicKey,
} from "./crypto";

// Components
import Header from "./components/Header";
import TextInput from "./components/TextInput";
import TextOutput from "./components/TextOutput";
import Toast from "./components/Toast";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase with error handling
let app: FirebaseApp;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Fallback to default config if env variables are not set
  app = initializeApp({
    apiKey: "AIzaSyCfGQu6kAByz448GCVzKC9SJf6qcBpzFrc",
    authDomain: "sharemytext.firebaseapp.com",
    projectId: "sharemytext",
    storageBucket: "sharemytext.appspot.com",
    messagingSenderId: "37383843087",
    appId: "1:37383843087:web:981732780de8f97030e27a",
  });
}

function App() {
  const firestore = getFirestore(app);
  var db = collection(firestore, "shareData");
  const [data, setData] = useState("");
  const [message, setMessage] = useState("");
  const [disable, setDisable] = useState(false);
  const [encypcode, setencypcode] = useState("");
  const [decryptcode, setdecryptcode] = useState("");
  const [decoded, setdecoded] = useState("");
  const [room, setroom] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [contentType, setContentType] = useState("text/plain");
  const [fileName, setFileName] = useState("demo.txt");
  const [received, setReceived] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const fileInput = useRef<HTMLInputElement>(null);

  // Get current theme from localStorage with fallback to system preference
  const [currentTheme, setCurrentTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // Display toast notification
  const showToast = (message: string, type: string = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Handle theme change with persistence
  const handleThemeChange = (theme: string) => {
    setCurrentTheme(theme);
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    
    // Add transition class
    document.documentElement.classList.add('theme-transition');
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transition');
    }, 300);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem("theme")) {
        handleThemeChange(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Set initial theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, []);

  // share data on input
  useEffect(() => {
    if (data) {
      shareData();
    }
  }, [data]);

  // Listen for room data changes
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, room ? room : "shared"), (snapshot) => {
      setReceived(snapshot?.data()?.data);
      setFileName(snapshot?.data()?.fileName);
    });

    return () => unsubscribe();
  }, [room, db]);

  const shareData = async () => {
    if (!data.trim()) {
      showToast("Please enter some text to share", "error");
      return;
    }

    setDisable(true);
    try {
      const dataJson = {
        data: encypcode 
          ? Crypto.AES.encrypt(data, encypcode).toString()
          : data,
        createdAt: Date.now(),
        fileName: fileName || "sharemytext.txt"
      };

      await setDoc(doc(db, room || "shared"), dataJson);
      
      const successMessage = encypcode 
        ? "Text encrypted and shared successfully!"
        : "Text shared successfully!";
      
      showToast(successMessage, "success");
      setMessage(
        `Shared data successfully at ${new Date(dataJson.createdAt).toUTCString()}`
      );
    } catch (error) {
      console.error("Error sharing data:", error);
      showToast(
        error instanceof Error 
          ? `Error: ${error.message}` 
          : "Error sharing text. Please try again.",
        "error"
      );
    } finally {
      setDisable(false);
    }
  };

  const handleDecryptData = async () => {
    if (!received || !decryptcode) {
      showToast("No text to decrypt or missing decryption key", "error");
      return;
    }

    try {
      const decoded = Crypto.AES.decrypt(received, decryptcode).toString(
        Crypto.enc.Utf8
      );
      
      if (!decoded) {
        throw new Error("Decryption resulted in empty text");
      }
      
      setdecoded(decoded);
      showToast("Text decrypted successfully!", "success");
    } catch (error) {
      console.error("Decryption error:", error);
      setdecoded("WRONG DECRYPTION KEY OR INVALID TEXT");
      showToast(
        error instanceof Error 
          ? `Decryption failed: ${error.message}` 
          : "Failed to decrypt text. Wrong key or invalid text.",
        "error"
      );
    }
  };

  const handleTextInput = (event: React.KeyboardEvent) => {
    if (event.keyCode === 13 && event.ctrlKey) {
      shareData();
    }
  };

  const copyOutput = async () => {
    if (decoded) {
      await navigator.clipboard.writeText(decoded);
      showToast("Decoded text copied to clipboard!", "info");
    } else {
      await navigator.clipboard.writeText(received);
      showToast("Received text copied to clipboard!", "info");
    }
  };

  const copyDecodedToData = () => {
    if (decoded) {
      setData(decoded);
      showToast("Decoded text copied to input area!", "info");
    } else {
      setData(received);
      showToast("Received text copied to input area!", "info");
    }
  };

  const handleFileDrop = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      showToast("No file selected", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size too large. Maximum size is 5MB", "error");
      return;
    }

    const reader = new FileReader();
    setFileName(file.name);
    setContentType(file.type);

    reader.onloadend = () => {
      if (fileInput.current) {
        fileInput.current.style.visibility = "hidden";
        fileInput.current.files = null;
      }
      setData(reader.result as string);
      showToast(`File "${file.name}" loaded successfully!`, "success");
    };

    reader.onerror = () => {
      showToast("Error reading file", "error");
    };

    reader.readAsText(file);
  };

  const handleDownload = () => {
    try {
      const content = decoded.trim() !== "" ? decoded : received;
      if (!content) {
        showToast("No content to download", "error");
        return;
      }

      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
      link.download = fileName || "sharemytext.txt";
      link.click();
      URL.revokeObjectURL(link.href);
      showToast(`${decoded ? 'Decoded' : 'Received'} text downloaded successfully!`, "success");
    } catch (error) {
      console.error("Download error:", error);
      showToast("Error downloading file", "error");
    }
  };

  const handleClearText = () => {
    setData("");
    setdecoded("");
  };

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl -translate-y-1/2 translate-x-1/4 transition-colors duration-300"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full filter blur-3xl translate-y-1/3 -translate-x-1/3 transition-colors duration-300"></div>
        <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl -translate-y-1/2 transition-colors duration-300"></div>
      </div>

      {/* Toast notification */}
      <Toast 
        show={toast.show} 
        message={toast.message} 
        type={toast.type} 
      />

      {/* Header */}
      <Header 
        currentTheme={currentTheme} 
        onThemeChange={handleThemeChange} 
      />

      <main className="container mx-auto px-4 py-6 sm:py-10 flex-grow z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-8">
          {/* Input Section */}
          <TextInput 
            data={data}
            onDataChange={setData}
            onTextInput={handleTextInput}
            onClearClick={handleClearText}
            onCopyOutputToInput={copyDecodedToData}
            onFileDrop={handleFileDrop}
          />

          {/* Output Section */}
          <TextOutput 
            received={received}
            decoded={decoded}
            decryptCode={decryptcode}
            onDecryptCodeChange={setdecryptcode}
            onDecryptClick={handleDecryptData}
            onCopyClick={copyOutput}
            onDownloadClick={handleDownload}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-base-200 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-base-content/60">
          <p>Made with ❤️ by <a href="https://github.com/himanshurajora" className="link link-primary">Himanshu Jangid</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
