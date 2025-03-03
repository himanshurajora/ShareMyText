import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import ReactLinkify from "react-linkify";
import "./App.css";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
} from "firebase/firestore";
import * as Crypto from "crypto-js";

// import hljs, {HLJSApi} from 'highlight.js'
const firebaseConfig = {
  apiKey: "AIzaSyCfGQu6kAByz448GCVzKC9SJf6qcBpzFrc",
  authDomain: "sharemytext.firebaseapp.com",
  projectId: "sharemytext",
  storageBucket: "sharemytext.appspot.com",
  messagingSenderId: "37383843087",
  appId: "1:37383843087:web:981732780de8f97030e27a",
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const themes = [
  "light",
  "dark",
  "cupcake",
  "bumblebee",
  "emerald",
  "corporate",
  "synthwave",
  "retro",
  "cyberpunk",
  "valentine",
  "halloween",
  "garden",
  "forest",
  "aqua",
  "lofi",
  "pastel",
  "fantasy",
  "wireframe",
  "black",
  "luxury",
  "dracula",
  "cmyk",
  "autumn",
  "business",
  "acid",
  "lemonade",
  "night",
  "coffee",
  "winter",
  "dim",
  "nord",
  "sunset",
];
interface Data {
  data: string;
  createdAt: number;
  fileName: string;
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
  const textInput = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // share data on input
  useEffect(() => {
    if (data) {
      shareData();
    }
  }, [data]);

  const shareData = async () => {
    setDisable(true);
    if (data) {
      var dataJson: any = {};
      if (encypcode) {
        dataJson = {
          data: Crypto.AES.encrypt(data, encypcode).toString(),
          createdAt: Date.now(),
        };
      } else {
        dataJson = {
          data: data,
          createdAt: Date.now(),
        };
      }

      await setDoc(doc(db, room ? room : "shared"), dataJson).finally(() => {
        setDisable(false);
      });
      setMessage(
        `shared data successfully at ${new Date(
          dataJson.createdAt
        ).toUTCString()}`
      );
    }
    setDisable(false);
  };

  const decryptData = async () => {
    try {
      if (received) {
        var decoded = Crypto.AES.decrypt(received, decryptcode).toString(
          Crypto.enc.Utf8
        );
        setdecoded(decoded);
        // setMessage(`decrypted data successfully at ${new Date(decoded.createdAt).toUTCString()}`)
      }
    } catch (e) {
      setdecoded("wrong decreption key or some error".toUpperCase());
    }
  };

  onSnapshot(doc(db, room ? room : "shared"), (snapshot) => {
    setReceived(snapshot?.data()?.data);
    setFileName(snapshot?.data()?.fileName);
  });

  const handleTextInput = (event: any) => {
    // detect control + enter pressed
    if (event.keyCode === 13 && event.ctrlKey) {
      shareData();
    }
  };

  const copyOutput = async () => {
    // copy decoded if exists otherwise the recieved text to clipboard
    if (decoded) {
      await navigator.clipboard.writeText(decoded);
    } else {
      await navigator.clipboard.writeText(received);
    }
  };

  const copyDecodedToData = () => {
    if (decoded) {
      setData(decoded);
    } else {
      setData(received);
    }
  };

  const handleFileDrag = () => {
    fileInput.current!.style.visibility = "visible";
    // make existing files null so that they can be selected again
    fileInput.current!.value = null;
  };

  const handleFileDrop = async (e: ChangeEvent<HTMLInputElement>) => {
    // read fileinput file as text
    var file = e.target.files[0];
    var reader = new FileReader();

    setFileName(file.name);
    setContentType(file.type);

    reader.onloadend = (e) => {
      fileInput.current!.style.visibility = "hidden";
      setData(reader.result as string);
      fileInput.current.files = null;
    };
    reader.readAsText(file);
  };

  const handleFileDragOut = () => {
    fileInput.current!.style.visibility = "hidden";
  };

  const Download = () => {
    var l = document.createElement("a");
    if (decoded.trim() !== "") {
      l.href = URL.createObjectURL(new Blob([decoded], { type: "text/plain" }));
      l.download = "sharemytext.txt";
      l.click();
    } else {
      l.href = URL.createObjectURL(
        new Blob([received], { type: "text/plain" })
      );
      l.download = "sharemytext.txt";
      l.click();
    }
  };

  const heading1 = "Share Your Text With Custom Encryption. 🤩 New Look!";
  const heading2 = "Share Your Text With Custom Encryption. 🤩 New Look!";

  const [heading, setHeading] = useState(heading1);

  const toggleHeading = () => {
    if (heading === heading1) {
      setHeading(heading2);
    }
    if (heading === heading2) {
      setHeading(heading1);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      toggleHeading();
    }, 5000);
  }, []);

  const currentTheme = localStorage.getItem("theme") || "light";

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      localStorage.getItem("theme") || "light"
    );
  });

  return (
    <div className="min-h-screen bg-base-100">
      {/* Navigation Bar */}
      <nav className="navbar bg-base-200 px-4 shadow-lg sticky top-0 z-50">
        <div className="flex-1">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            ShareMyText
          </h1>
        </div>
        <div className="flex-none gap-4">
          <select
            className="select select-bordered select-sm"
            onChange={(e) => {
              const theme = e.target.value;
              document.documentElement.setAttribute("data-theme", theme);
              localStorage.setItem("theme", theme);
            }}
          >
            {themes.map((theme) => (
              <option key={theme} value={theme} selected={theme === currentTheme}>
                {theme[0].toUpperCase() + theme.slice(1)}
              </option>
            ))}
          </select>
          <a
            href="https://github.com/himanshurajora/ShareMyText/issues"
            target="_blank"
            className="btn btn-ghost btn-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Suggest
          </a>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body p-4">
              <h2 className="card-title mb-4">Share Text</h2>
              <div className="relative">
                <input
                  type="file"
                  className="absolute top-0 left-0 w-full h-full opacity-0 -z-20"
                  onChange={handleFileDrop}
                  onDragLeave={handleFileDragOut}
                  ref={fileInput}
                />
                <textarea
                  className="textarea textarea-bordered w-full h-[50vh] font-mono text-sm"
                  ref={textInput}
                  onDragEnter={handleFileDrag}
                  onKeyDown={handleTextInput}
                  onChange={(e) => setData(e.target.value)}
                  value={data}
                  placeholder="Enter your text here. Press Ctrl + Enter to share"
                ></textarea>
                
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button
                    className="btn btn-circle btn-ghost btn-sm tooltip"
                    data-tip="Copy output to input"
                    onClick={copyDecodedToData}
                  >
                    ⬆️
                  </button>
                  <button
                    className="btn btn-circle btn-ghost btn-sm tooltip"
                    data-tip="Clear"
                    onClick={() => {
                      setData("");
                      setdecoded("");
                    }}
                  >
                    ❌
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                <input
                  type="text"
                  className="input input-bordered input-sm flex-1"
                  placeholder="Encryption Code (Optional)"
                  onChange={(e) => setencypcode(e.target.value)}
                />
                <input
                  className="input input-bordered input-sm flex-1"
                  type="text"
                  placeholder="Room ID (Required)*"
                  value={room}
                  onChange={(e) => {
                    setroom(e.target.value);
                    setdecoded("");
                  }}
                />
                <button 
                  className={`btn btn-primary btn-sm ${disable ? 'loading' : ''}`}
                  onClick={shareData}
                  disabled={disable}
                >
                  {!disable ? "Share" : "Sending..."}
                </button>
              </div>
            </div>
          </div>

          {/* Output Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body p-4">
              <h2 className="card-title mb-4">Received Text</h2>
              <div className="flex gap-4 mb-4">
                <input
                  className="input input-bordered input-sm flex-1"
                  type="text"
                  placeholder="Decryption Code"
                  onChange={(e) => setdecryptcode(e.target.value)}
                />
                <button 
                  className="btn btn-warning btn-sm"
                  onClick={decryptData}
                >
                  Decrypt
                </button>
              </div>

              <div className="relative">
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    className="btn btn-circle btn-ghost btn-sm tooltip"
                    data-tip="Copy to Clipboard"
                    onClick={copyOutput}
                  >
                    📄
                  </button>
                  <button
                    className="btn btn-circle btn-ghost btn-sm tooltip"
                    data-tip="Download"
                    onClick={Download}
                  >
                    📥
                  </button>
                </div>
                <ReactLinkify
                  componentDecorator={(decoratedHref, decoratedText, key) => (
                    <a target="blank" href={decoratedHref} key={key} className="text-primary hover:underline">
                      {decoratedText}
                    </a>
                  )}
                >
                  <pre className="bg-base-300 p-4 rounded-lg min-h-[50vh] font-mono text-sm whitespace-pre-wrap">
                    {decoded || received}
                  </pre>
                </ReactLinkify>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>Made with ❤️ by <a href="https://github.com/himanshurajora" className="text-primary hover:underline">@himanshurajora</a></p>
        </div>
      </footer>
    </div>
  );
}

export default App;
