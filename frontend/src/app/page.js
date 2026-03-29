// src/app/page.js
// extremely basic and barebones app to test if routes work
"use client"

import { useState } from "react"
import { getImage, predict } from "@/lib/api"
import Drawer from "@/components/Drawer"

export default function Home() {
  const [imgId, setImgId] = useState(null)
  const [image, setImage] = useState(null)
  const [predictedImage, setPredictedImage] = useState(null)
  const [userBoxes, setUserBoxes] = useState([])
  const [groundTruths, setGroundTruths] = useState([])
  const [detections, setDetections] = useState([])
  const [isDrawable, setIsDrawable] = useState(true)

  async function handleGetImage() {
    const data = await getImage()
    setImgId(data.img_id)
    setImage(data.image)
    setPredictedImage(null)  // reset prediction on new image
  }

  async function handlePredict() {
    setIsDrawable(false)
    if (!imgId){ console.log("no image id"); return}  
    const data = await predict(imgId)
    console.log("I have the data")
    setPredictedImage(data.image)
    setDetections(data.detections)
    setGroundTruths(data.ground_truth)

    // Predictions and Ground Truths need to be in the following format:
    // Array[{label: String, bbox: Array[x1, y1, x2, y2]}]
    // userBoxes currently looks like this: 
    console.log(userBoxes)

  }

  return (
    <main>
      <button onClick={handleGetImage}>Get Image</button>
      <div>
        {image && (
          <>
            <Drawer
              image={image}
              drawable={isDrawable}
              onBoxesChange={setUserBoxes}
            />
            <button onClick={handlePredict}>Run Prediction</button>
          </>
        )}
      </div>
      {predictedImage && (
        <img src={`data:image/jpeg;base64,${predictedImage}`} alt="prediction" />
      )}
    </main>
  )
}