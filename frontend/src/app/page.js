// src/app/page.js
// extremely basic and barebones app to test if routes work
"use client"

import { useState } from "react"
import { getImage, predict } from "@/lib/api"

export default function Home() {
  const [imgId, setImgId] = useState(null)
  const [image, setImage] = useState(null)
  const [predictedImage, setPredictedImage] = useState(null)

  async function handleGetImage() {
    const data = await getImage()
    setImgId(data.img_id)
    setImage(data.image)
    setPredictedImage(null)  // reset prediction on new image
  }

  async function handlePredict() {
    if (!imgId){ console.log("no image id"); return}  
    const data = await predict(imgId)
    console.log("I have the data")
    setPredictedImage(data.image)
  }

  return (
    <main>
      <button onClick={handleGetImage}>Get Image</button>

      {image && (
        <>
          <img src={`data:image/jpeg;base64,${image}`} alt="xray" /> {/* JSX can directly decode base64 bytes! */ }
          <button onClick={handlePredict}>Run Prediction</button>
        </>
      )}

      {predictedImage && (
        <img src={`data:image/jpeg;base64,${predictedImage}`} alt="prediction" />
      )}
    </main>
  )
}