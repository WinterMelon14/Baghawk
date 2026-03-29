// src/app/page.js
// extremely basic and barebones app to test if routes work
"use client"

import { useState } from "react"
import { getImage, predict } from "@/lib/api"
import Drawer from "@/components/Drawer"
import score from "@/lib/scoring"
import AnnotatedImage from "@/components/AnnotatedImage"
import Scoreboard from "@/components/Scoreboard"

export default function Home() {
  const [imgId, setImgId] = useState(null)
  const [image, setImage] = useState(null)
  const [predictedImage, setPredictedImage] = useState(null)
  const [userBoxes, setUserBoxes] = useState([])
  const [isDrawable, setIsDrawable] = useState(true)
  const [scores, setScores] = useState({human: 0, model: 0})
  const [deltas, setDeltas] = useState({human: 0, model: 0})
  const [groundTruths, setGroundTruths] = useState(null)

  async function handleGetImage() {
    setUserBoxes([])
    setIsDrawable(true)
    const data = await getImage()
    setImgId(data.img_id)
    setImage(data.image)
    setPredictedImage(null)  // reset prediction on new image
  }

  async function handlePredict() {
    if (!userBoxes.length){ alert("Draw a prediction first!"); return}
    setIsDrawable(false)
    if (!imgId){ console.log("no image id"); return}  
    const data = await predict(imgId)

    setPredictedImage(data.image)

    // Predictions and Ground Truths need to be in the following format:
    // Array[{label: String, bbox: Array[x1, y1, x2, y2]}]
    // userBoxes currently looks like this: Array[{label: string, x1:int, y1: int, x2:int, y2}]

    let formattedBoxes = userBoxes.map(box => ({label: box.label, bbox: [box.x1, box.y1, box.x2, box.y2]}))

    setGroundTruths(data.ground_truth)
    // groundTruths is already formatted

    const modelScore = score(data.detections, data.ground_truth)
    const humanScore = score(formattedBoxes, data.ground_truth)
    setScores({model: scores.model + modelScore, human: scores.human + humanScore})
    setDeltas({model: modelScore, human: humanScore})
  }

  return (
    <main>
      <Scoreboard scores={scores} deltas={deltas} />
      <button onClick={handleGetImage}>Get Image</button>
      <div>
        {image && (
          <>
            <Drawer
              key={imgId}  // forces full remount when imgId changes
              image={image}
              drawable={isDrawable}
              onBoxesChange={setUserBoxes}
            />
            <button onClick={handlePredict}>Run Prediction</button>
          </>
        )}
      </div>
      {predictedImage && (
       
         <div style={{ display: "flex", gap: "20px" }}>
         <img src={`data:image/jpeg;base64,${predictedImage}`} alt="prediction" />
        <AnnotatedImage
            image={image}
            boxes={groundTruths}
            color="green"
            title="Ground Truth"
        />
    </div>
      )}
    </main>
  )
}