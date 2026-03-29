// src/app/page.js
// extremely basic and barebones app to test if routes work
"use client"

import { useState } from "react"
import { getImage, predict } from "@/lib/api"
import Drawer from "@/components/Drawer"
import score from "@/lib/scoring"
import AnnotatedImage from "@/components/AnnotatedImage"
import Scoreboard from "@/components/Scoreboard"
import Modal from "@/components/Modal"

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
  const [scores, setScores] = useState({ human: 0, model: 0 })
  const [deltas, setDeltas] = useState({ human: 0, model: 0 })
  const [groundTruths, setGroundTruths] = useState(null)
  const [showHelp, setShowHelp] = useState(true)


  async function handleGetImage() {
    setUserBoxes([])
    setIsDrawable(true)
    const data = await getImage()
    setImgId(data.img_id)
    setImage(data.image)
    setPredictedImage(null)  // reset prediction on new image
  }

  async function handlePredict() {
    if (!userBoxes.length) { alert("Draw a prediction first!"); return }
    setIsDrawable(false)
    if (!imgId) { console.log("no image id"); return }
    const data = await predict(imgId)

    setPredictedImage(data.image)

    // Predictions and Ground Truths need to be in the following format:
    // Array[{label: String, bbox: Array[x1, y1, x2, y2]}]
    // userBoxes currently looks like this: Array[{label: string, x1:int, y1: int, x2:int, y2}]

    let formattedBoxes = userBoxes.map(box => ({ label: box.label, bbox: [box.x1, box.y1, box.x2, box.y2] }))

    setGroundTruths(data.ground_truth)
    // groundTruths is already formatted

    const modelScore = score(data.detections, data.ground_truth)
    const humanScore = score(formattedBoxes, data.ground_truth)
    setScores({ model: scores.model + modelScore, human: scores.human + humanScore })
    setDeltas({ model: modelScore, human: humanScore })
  }


  return (
    <main style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "#f0f0f0",
      fontFamily: "monospace",
      padding: "24px",
      paddingTop: 0
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "4px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{ fontSize: "20px", letterSpacing: "0.2em", margin: 0 }}>X-RAY CHALLENGE</h1>
          <button
            onClick={() => setShowHelp(true)}
            style={{
              background: "transparent",
              border: "1px solid #555",
              color: "#aaa",
              borderRadius: "50%",
              width: "22px",
              height: "22px",
              cursor: "pointer",
              fontSize: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              flexShrink: 0
            }}
          >
            ?
          </button>
        </div>
        <Scoreboard scores={scores} deltas={deltas} />
      </div>
      {/* Modal */}
      {showHelp && (
        <Modal title="HOW TO PLAY" onClose={() => setShowHelp(false)}>
          <ol style={{ color: "#ccc", lineHeight: 2, paddingLeft: "4px", margin: "0 0 8px 0" }}>
            <li>Click <strong style={{ color: "#f0f0f0" }}>Get Image</strong> to load a random X-ray</li>
            <li>Draw bounding boxes around any contraband you spot</li>
            <li>Select a label for each box from the dropdown</li>
            <li>Right click inside a box to delete it</li>
            <li>Click <strong style={{ color: "#f0f0f0" }}>Run Prediction</strong> to see the model's guess</li>
            <li>Compare your result against the ground truth</li>
            <li>Score is based on box accuracy and correct labels</li>
          </ol>

        </Modal>
      )}
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