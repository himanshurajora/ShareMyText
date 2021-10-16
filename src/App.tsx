import React, { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'
import firebase from 'firebase'
import app from 'firebase/app'
import 'firebase/firestore'


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

function App() {

  var db = firebase.firestore()
  var ref = db.collection("shareData")
  const [data, setData] = useState("")
  const [message, setMessage] = useState("")
  const [disable, setDisable] = useState(false) 
  const [r, setR] = useState("")
  const shareData = async () => {
    setDisable(true)
    if (data) {
      var dataJson = {
        "data": data,
        "createdAt": Date.now()
      }

      await ref.doc("shared").set(dataJson)
      setMessage(`shared data successfully at ${new Date(dataJson.createdAt).toUTCString()}`)
    }
    setDisable(false)
  }

  ref.doc("shared").onSnapshot((snapshot)=>{
    console.log(snapshot.data())
    setR(snapshot.data()!.data)
  })

  return (
    <div className="App">
      <textarea rows={20} onChange={(e) => { setData(e.target.value) }} placeholder={"Enter You Text Here"}></textarea>
      <p> <span> <button onClick={shareData}>{!disable ? "Share" : "Sending In Progress..."}</button></span> {message}</p>
      <p>Recieved data here:</p>
      <p id={"r"}>{r}</p>
    </div>
  )
}

export default App
