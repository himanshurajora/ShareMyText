import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import ReactLinkify from "react-linkify";
import "./App.css";
import firebase from "firebase";
import "firebase/firestore";
import * as Crypto from "crypto-js";
import { appIpcRenderer, getIpcRenderer } from "./ipcRenderer.config";
declare global {
  interface Window {
    Cypress: any;
    store: any;
  }
}

// import hljs, {HLJSApi} from 'highlight.js'
var firebaseConfig = {
  apiKey: "AIzaSyCTvOjkdho2r7l4m-GVPYiSrEuazQeYu2s",
  authDomain: "chat-fire-test-756d8.firebaseapp.com",
  projectId: "chat-fire-test-756d8",
  storageBucket: "chat-fire-test-756d8.appspot.com",
  messagingSenderId: "945038291938",
  appId: "1:945038291938:web:b4c7699615c23068967fbb",
  measurementId: "G-WWFW3PM397",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

interface Data {
  data: string;
  createdAt: number;
  fileName: string;
}

function App() {
  var db = firebase.firestore();
  var ref = db.collection("shareData");
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
  const [r, setR] = useState("");
  const textInput = useRef<HTMLTextAreaElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const shareData = async () => {
    console.log(fileName);
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

      await ref.doc(room ? room : "shared").set(dataJson);
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
      if (r) {
        var decoded = Crypto.AES.decrypt(r, decryptcode).toString(
          Crypto.enc.Utf8
        );
        setdecoded(decoded);
        // setMessage(`decrypted data successfully at ${new Date(decoded.createdAt).toUTCString()}`)
      }
    } catch (e) {
      setdecoded("wrong decreption key or some error".toUpperCase());
    }
  };

  ref.doc(room ? room : "shared").onSnapshot((snapshot: any) => {
    setR(snapshot?.data()?.data);
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
      await navigator.clipboard.writeText(r);
    }
  };

  const copyDecodedToData = () => {
    if (decoded) {
      setData(decoded);
    } else {
      setData(r);
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
      l.href = URL.createObjectURL(new Blob([r], { type: "text/plain" }));
      l.download = "sharemytext.txt";
      l.click();
    }
  };

  const appIpcRenderer = getIpcRenderer(window);

  useEffect(() => {
    if (appIpcRenderer) {
      window.mockIpcRenderer = appIpcRenderer;
      appIpcRenderer.on("share-data", (data: string) => {
        console.log(data);
      });
    }

    return () => {
      appIpcRenderer.removeAllListeners();
    };
  }, []);

  const [heading, setHeading] = useState(
    "Share Your Text With Custom Encryption"
  );

  return (
    <div className="App" onKeyDown={handleTextInput}>
      <span id="forkongithub">
        <a href="https://github.com/himanshurajora/ShareMyText">
          Fork me on GitHub
        </a>
      </span>
      <h4 id="wrapper">{heading}</h4>
      <code>
        <div className="data-section">
          <input
            type="file"
            name=""
            id=""
            onChange={handleFileDrop}
            onDragLeave={handleFileDragOut}
            ref={fileInput}
          />
          <textarea
            className="input-text"
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
        </div>
      </code>
      <p>
        <br />{" "}
        <input
          type="text"
          id="enc"
          className="inputs"
          placeholder="Encryption Code (Optional)"
          onChange={(e) => {
            setencypcode(e.target.value);
          }}
        />{" "}
        <input
          id="room"
          className="inputs"
          type="text"
          placeholder="Room Id (Optional)"
          value={room}
          onChange={(e) => {
            setroom(e.target.value);
            setdecoded("");
          }}
        />{" "}
        <span>
          {" "}
          <button className="btn" onClick={shareData}>
            {!disable ? "Share" : "Sending In Progress..."}
          </button>
        </span>
      </p>
      <p className="text-small">{message}</p>
      <button className="btn" onClick={copyOutput}>
        Copy Output
      </button>
      <button className="btn" onClick={copyDecodedToData}>
        Copy Output To TextArea
      </button>
      <button onClick={Download} className="btn" aria-disabled="true">
        Download
      </button>
      <br />
      <p className="text-small">Recieved data here:</p>
      <ReactLinkify>
        <pre id={"r"}>{r}</pre>
      </ReactLinkify>
      <p>
        {" "}
        <input
          className="inputs"
          type="text"
          placeholder="Decryption Code"
          onChange={(e) => {
            setdecryptcode(e.target.value);
          }}
        />{" "}
        <span>
          {" "}
          <button className="btn" onClick={decryptData}>
            {"Decrypt Data"}
          </button>
        </span>
      </p>
      <ReactLinkify>
        <pre id={"decoded"}>{decoded}</pre>
      </ReactLinkify>
    </div>
  );
}

export default App;
