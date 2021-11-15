import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import firebase from 'firebase'
import app from 'firebase/app'
import 'firebase/firestore'
import * as Crypto from 'crypto-js'

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

interface Data{
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
  const [r, setR] = useState("")
  const shareData = async () => {
    setDisable(true)
    if (data) {
      var dataJson = {"data" : "some data", "createdAt": 1337}
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

        await ref.doc("shared").set(dataJson)
        setMessage(`shared data successfully at ${new Date(dataJson.createdAt).toUTCString()}`)
      }
      setDisable(false)
    }

    const decryptData = async () => {
     try{
      if (r) {
        var decoded  = Crypto.AES.decrypt(r, decryptcode).toString(Crypto.enc.Utf8)
        setdecoded(decoded)
        // setMessage(`decrypted data successfully at ${new Date(decoded.createdAt).toUTCString()}`)
      }
      } catch(e) {
          setdecoded("wrong decreption key or some error".toUpperCase())
      }
     }


    ref.doc("shared").onSnapshot((snapshot) => {
      setR(snapshot.data()!.data)
    })

    const em = () => {
    
    }
    return (
      <div className="App">
        <textarea rows={20} onChange={(e) => { setData(e.target.value) }} placeholder={"Enter You Text Here"}></textarea>
        <p> <input type="text" placeholder='Encryption Code' onChange={(e)=>{setencypcode(e.target.value)}} /> <span> <button onClick={em}>{!disable ? "Share" : "Sending In Progress..."}</button></span> {message}</p>
        <p>Recieved data here:</p>
        <pre id={"r"}>{r}</pre>
        <pre id={"decoded"}>{decoded}</pre>
        <p> <input type="text" placeholder='Decryption Code' onChange={(e)=>{setdecryptcode(e.target.value)}} /> <span> <button onClick={decryptData}>{"Decrypt Data"}</button></span></p>
      </div>
    )
  }

  export default App
