import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import './App.css'
import firebase from 'firebase'
import 'firebase/firestore'
import * as Crypto from 'crypto-js'
// import hljs, {HLJSApi} from 'highlight.js'
var firebaseConfig = {
  apiKey: "AIzaSyCTvOjkdho2r7l4m-GVPYiSrEuazQeYu2s",
  authDomain: "chat-fire-test-756d8.firebaseapp.com",
  projectId: "chat-fire-test-756d8",
  storageBucket: "chat-fire-test-756d8.appspot.com",
  messagingSenderId: "945038291938",
  appId: "1:945038291938:web:b4c7699615c23068967fbb",
  measurementId: "G-WWFW3PM397"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig)

interface Data {
  data: string,
  createdAt: number
}

function App() {
  var db = firebase.firestore()
  var ref = db.collection("shareData")
  const [data, setData] = useState("")
  const [message, setMessage] = useState("")
  const [disable, setDisable] = useState(false)
  const [encypcode, setencypcode] = useState("")
  const [decryptcode, setdecryptcode] = useState("")
  const [decoded, setdecoded] = useState("")
  const [room, setroom] = useState("");
  const [r, setR] = useState("")
  const textInput = useRef<HTMLTextAreaElement>(null)
  const fileInput = useRef<HTMLInputElement>(null)


  const shareData = async () => {
    setDisable(true)
    if (data) {
      var dataJson = { "data": "some data", "createdAt": 1337 }
      if (encypcode) {
        dataJson = {
          "data": Crypto.AES.encrypt(data, encypcode).toString(),
          "createdAt": Date.now(),
        }
      } else {
        dataJson = {
          "data": data,
          "createdAt": Date.now(),
        }
      }

      await ref.doc(room ? room : "shared").set(dataJson)
      setMessage(`shared data successfully at ${new Date(dataJson.createdAt).toUTCString()}`)
    }
    setDisable(false)
  }

  const decryptData = async () => {
    try {
      if (r) {
        var decoded = Crypto.AES.decrypt(r, decryptcode).toString(Crypto.enc.Utf8)
        setdecoded(decoded)
        // setMessage(`decrypted data successfully at ${new Date(decoded.createdAt).toUTCString()}`)
      }
    } catch (e) {
      setdecoded("wrong decreption key or some error".toUpperCase())
    }
  }


  ref.doc(room ? room : "shared").onSnapshot((snapshot: any) => {
    setR(snapshot?.data()?.data)
  })
  // 

  const handleTextInput = (event: any) => {
    // detect control + enter pressed 
    if (event.keyCode === 13 && event.ctrlKey) {
      shareData()
    }
  }

  const copyOutput = async () => {
    // copy decoded if exists otherwise the recieved text to clipboard
    if (decoded) {
      await navigator.clipboard.writeText(decoded)
    } else {
      await navigator.clipboard.writeText(r)
    }
    console.log("copied")
  }

  const copyDecodedToData = () => {
    if (decoded) {
      setData(decoded)
    } else {
      setData(r)
    }
  }

  const handleFileDrag = () => {
    fileInput.current!.style.visibility = "visible"
    // make existing files null so that they can be selected again
    fileInput.current!.value = null
  }

  const handleFileDrop = (e : ChangeEvent<HTMLInputElement>) => {
    // read fileinput file as text
    var file = e.target.files[0]
    var reader = new FileReader()
    console.log("here");
    
    reader.onloadend = (e) => {
      fileInput.current!.style.visibility = "hidden"
      setData(reader.result as string)
      fileInput.current.files = null
    }
    reader.readAsText(file)
  }

  const handleFileDragOut = () =>{
    fileInput.current!.style.visibility = "hidden"
    console.log("drag out");
    
  }

  return (
    <div className="App" onKeyDown={handleTextInput}>
      <span id="forkongithub"><a href="https://github.com/himanshurajora/ShareMyText">Fork me on GitHub</a></span>
      <h4 id='wrapper'>Share Your Text With Custom Encryption</h4>
      <code>
        <div className="data-section">
          <input type="file" name="" id="" onChange={handleFileDrop}  onDragLeave={handleFileDragOut}  ref={fileInput} />
          <textarea className='input-text' rows={20} ref={textInput} onDragEnter={handleFileDrag} onKeyDown={handleTextInput} onChange={(e) => { setData(e.target.value) }} value={data} placeholder={"Enter You Text Here, Press Ctrl + Enter to share"}></textarea>
        </div>
      </code>
      <p><br /> <input type="text" id='enc' className='inputs' placeholder='Encryption Code (Optional)' onChange={(e) => { setencypcode(e.target.value) }} /> <input id='room' className='inputs' type="text" placeholder='Room Id (Optional)' value={room} onChange={(e) => { setroom(e.target.value); setdecoded(""); }} /> <span> <button className='btn' onClick={shareData}>{!disable ? "Share" : "Sending In Progress..."}</button></span></p>
      <p className='text-small'>{message}</p>
      <button className='btn' onClick={copyOutput}>Copy Output</button>
      <button className='btn' onClick={copyDecodedToData}>Copy Output To TextArea</button>
      <br />
      <p className='text-small'>Recieved data here:</p>
      <pre id={"r"}>{r}</pre>
      <p> <input className='inputs' type="text" placeholder='Decryption Code' onChange={(e) => { setdecryptcode(e.target.value) }} /> <span > <button className='btn' onClick={decryptData}>{"Decrypt Data"}</button></span></p>
      <pre id={"decoded"}>{decoded}</pre>
    </div>
  )
}

export default App