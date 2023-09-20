import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import ReactLinkify from "react-linkify";
import "./App.css";
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getFirestore, onSnapshot, setDoc } from "firebase/firestore";
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

interface Data {
  data: string;
  createdAt: number;
  fileName: string;
}

function App() {
  const firestore = getFirestore(app)
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

  onSnapshot(doc(db, room ? room : "shared"), (snapshot) => {
    setR(snapshot?.data()?.data);
    setFileName(snapshot?.data()?.fileName);

  })

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


  const heading1 = "Share Your Text With Custom Encryption.";
  const heading2 = "Warning ⚠️ (Database will be truncated on 20 Sep, 2023).";

  const [heading, setHeading] = useState(
    heading1
  );

  const toggleHeading = () => {
    if (heading === heading1) {
      setHeading(heading2);
    } if (heading === heading2) { setHeading(heading1) }
  }

  useEffect(() => {
    setTimeout(() => {
      toggleHeading();
    }, 5000)
  }, []);

  return (
    <div className="App" onKeyDown={handleTextInput}>
      <span id="forkongithub">
        <a href="https://github.com/himanshurajora/ShareMyText">
          Fork me on GitHub
        </a>
      </span>
      <h3 id="wrapper">{heading} Made by <a href="https://github.com/himanshurajora">@himanshurajora</a></h3>
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
      <ReactLinkify
        componentDecorator={(decoratedHref, decoratedText, key) => (
          <a target="blank" href={decoratedHref} key={key}>
            {decoratedText}
          </a>
        )}
      >
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
      <p style={{color: "white"}}>
        Hi there! ShareMyText is going to have a good future. We are soon going to make some changes regarding data security. Please raise issues on <a href="https://github.com/himanshurajora/ShareMyText" target="_blank">Github</a> if you want to provide any suggesions.
      </p>
    </div>
  );
}

export default App;
