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

      await setDoc(doc(db, room ? room : "shared"), dataJson);
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
    <div
      className="App w-full p-4 flex flex-col gap-2"
      onKeyDown={handleTextInput}
    >
      <span className="fixed rotate-45 -right-8 top-10 z-10 bg-base-200 p-4">
        <a
          href="https://github.com/himanshurajora/ShareMyText/issues"
          target="_blank"
        >
          Raise a suggestion 🙋
        </a>
      </span>
      <div className="flex flex-row gap-2 items-center">
        <h3 className="text-xl font-bold inline">
          <abbr title="Hi there! ShareMyText is going to have a good future. We are soon going to make some changes regarding data security. If you have any suggestions in your mide, please raise an issues.">
            {heading}
          </abbr>
          <b>
            {" "}
            Made by{" "}
            <a href="https://github.com/himanshurajora">@himanshurajora</a>
          </b>
        </h3>
        <select
          className="select select-bordered inline"
          onChange={(e) => {
            const theme = e.target.value;
            document.documentElement.setAttribute("data-theme", theme);
            localStorage.setItem("theme", theme);
          }}
        >
          {themes.map((theme) => (
            <option key={theme} value={theme} selected={theme === currentTheme}>
              {theme[0].toUpperCase() + theme.slice(1)} theme
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-row flex-wrap w-full gap-2">
        <div className="flex-1">
          <code>
            <div className="relative">
              <input
                type="file"
                className="absolute top-0 left-0 w-full h-full opacity-0 -z-20 px-2 py-3"
                name=""
                id=""
                onChange={handleFileDrop}
                onDragLeave={handleFileDragOut}
                ref={fileInput}
              />
              <textarea
                className="textarea textarea-bordered w-full"
                rows={20}
                ref={textInput}
                onDragEnter={handleFileDrag}
                onKeyDown={handleTextInput}
                onChange={(e) => {
                  setData(e.target.value);
                }}
                value={data}
                placeholder={"Enter You Text Here, Press Ctrl + Enter to share"}
              ></textarea>
              <div
                className="tooltip tooltip-right absolute left-2 bottom-4"
                data-tip="Copy output to current textarea"
              >
                <button
                  className="btn btn-ghost border-base-300 border-2"
                  onClick={copyDecodedToData}
                >
                  ⬆️
                </button>
              </div>
              {/* Clear button */}
              <button
                className="btn btn-error btn-ghost absolute right-2 bottom-4"
                onClick={() => {
                  setData("");
                  setdecoded("");
                }}
              >
                Clear
              </button>
            </div>
          </code>
          <div className="flex flex-row gap-2">
            <input
              type="text"
              id="enc"
              className="input input-bordered"
              placeholder="Encryption Code (Optional)"
              onChange={(e) => {
                setencypcode(e.target.value);
              }}
            />{" "}
            <input
              id="room"
              className="input input-bordered"
              type="text"
              placeholder="Room Id (Optional)"
              value={room}
              onChange={(e) => {
                setroom(e.target.value);
                setdecoded("");
              }}
            />
            <button className="btn btn-primary" onClick={shareData}>
              {!disable ? "Share" : "Sending In Progress..."}
            </button>
            <p className="text-small">{message}</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-2">
          <div className="flex flex-row gap-2">
            <input
              className="input input-bordered"
              type="text"
              placeholder="Decryption Code"
              onChange={(e) => {
                setdecryptcode(e.target.value);
              }}
            />
            <button className="btn btn-warning" onClick={decryptData}>
              Decrypt Data
            </button>
          </div>

          <div className="flex flex-col gap-2 relative">
            <div className="flex flex-row gap-2 right-0 top-0 absolute p-2">
              <div className="tooltip" data-tip="Copy to Clipboard">
                <button
                  className="btn btn-ghost border-2 border-base-300"
                  onClick={copyOutput}
                >
                  📄
                </button>
              </div>
              <div className="tooltip" data-tip="Download as file">
                <button
                  onClick={Download}
                  className="btn btn-ghost border-2 border-base-300"
                  aria-disabled="true"
                >
                  📥
                </button>
              </div>
            </div>
            <ReactLinkify
              componentDecorator={(decoratedHref, decoratedText, key) => (
                <a target="blank" href={decoratedHref} key={key}>
                  {decoratedText}
                </a>
              )}
            >
              <pre className="bg-primary text-base-100 p-3 rounded-md min-h-28">
                {decoded || received}
              </pre>
            </ReactLinkify>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
