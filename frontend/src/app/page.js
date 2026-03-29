// src/app/page.js
// extremely basic and barebones app to test if routes work
"use client"

import { useState } from "react"
import { getImage, predict } from "@/lib/api"
import Drawer from "@/components/Drawer"
import score from "@/lib/scoring"
import AnnotatedImage from "@/components/AnnotatedImage"
import Scoreboard from "@/components/Scoreboard"


const btnStyle = {
    background: "transparent",
    border: "1px solid #555",
    color: "#f0f0f0",
    padding: "8px 20px",
    fontFamily: "monospace",
    cursor: "pointer",
    letterSpacing: "0.1em",
    fontSize: "13px"
}

const panelStyle = {
    border: "1px solid #333",
    height: "400px",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111"
}

const imgStyle = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain"
}

const placeholderStyle = {
    color: "#fff",
    fontSize: "12px",
    letterSpacing: "0.1em"
}

const labelStyle = {
    fontSize: "14px",
    letterSpacing: "0.2em",
    color: "#cfcaca",      
    margin: "0 0 8px 0",
    fontWeight: "bold"
}

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
    <main style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        color: "#f0f0f0",
        fontFamily: "monospace",
        padding: "24px"
    }}>
        {/* Header */}
      <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "24px",
          height: "60px"  
      }}>
              <h1 style={{ fontSize: "20px", letterSpacing: "0.2em", margin: "0 0 16px 0" }}>X-RAY CHALLENGE</h1>

          <Scoreboard scores={scores} deltas={deltas} />
      </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
            <button onClick={handleGetImage} style={btnStyle}>
                {image ? "Next Image" : "Get Image"}
            </button>
            {image && (
                <button onClick={handlePredict} style={btnStyle} disabled={!isDrawable}>
                    Run Prediction
                </button>
            )}
        </div>

        {/* Image panels */}
        {image && (
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>

                {/* Drawing panel */}
                <div style={{ flex: 1 }}>
                    <p style={labelStyle}>YOUR PREDICTION</p>
                    <div style={panelStyle}>
                        <Drawer
                            key={imgId}
                            image={image}
                            drawable={isDrawable}
                            onBoxesChange={setUserBoxes}
                        />
                    </div>
                </div>

                {/* Model prediction panel */}
                <div style={{ flex: 1 }}>
                    <p style={labelStyle}>MODEL PREDICTION</p>
                    <div style={panelStyle}>
                        {predictedImage
                            ? <img
                                src={`data:image/jpeg;base64,${predictedImage}`}
                                alt="model prediction"
                                style={imgStyle}
                              />
                            : <div style={placeholderStyle}>Awaiting prediction...</div>
                        }
                    </div>
                </div>

                {/* Ground truth panel */}
                <div style={{ flex: 1 }}>
                    <p style={labelStyle}>GROUND TRUTH</p>
                    <div style={panelStyle}>
                        {predictedImage
                            ? <AnnotatedImage image={image} boxes={groundTruths} color="lime" title="" />
                            : <div style={placeholderStyle}>Submit to reveal...</div>
                        }
                    </div>
                </div>

            </div>
        )}
    </main>
)

}