import React, { useState, useEffect, useRef } from "react";
import "./App.css";
import { initializeApp, FirebaseApp } from "firebase/app";
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";

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
  const db = collection(firestore, "shareData");
  const [data, setData] = useState("");
  const [decoded, setdecoded] = useState("");
  const [fileName, setFileName] = useState("demo.txt");
  const [received, setReceived] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const fileInput = useRef<HTMLInputElement>(null);

  // Display toast notification
  const showToast = (message: string, type: string = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  // share data on input
  useEffect(() => {
    if (data) {
      shareData();
    }
  }, [data]);

  // Listen for room data changes
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "shared"), (snapshot) => {
      setReceived(snapshot?.data()?.data);
      setFileName(snapshot?.data()?.fileName);
    });

    return () => unsubscribe();
  }, [db]);

  const shareData = async () => {
    if (!data.trim()) {
      showToast("Please enter some text to share", "error");
      return;
    }

    try {
      const dataJson = {
        data,
        createdAt: Date.now(),
        fileName: fileName || "sharemytext.txt"
      };

      await setDoc(doc(db, "shared"), dataJson);
      
      showToast("Text shared successfully!", "success");
    } catch (error) {
      console.error("Error sharing data:", error);
      showToast(
        error instanceof Error 
          ? `Error: ${error.message}` 
          : "Error sharing text. Please try again.",
        "error"
      );
    }
  };

  const handleDecryptData = async () => {
    if (!received) {
      showToast("No text to decrypt", "error");
      return;
    }

    try {
      setdecoded(received);
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

  const handleFileDrop = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        currentTheme={localStorage.getItem("theme") || "light"}
        onThemeChange={(theme) => {
          document.documentElement.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);
        }}
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
            decryptCode=""
            onDecryptCodeChange={() => {}}
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
