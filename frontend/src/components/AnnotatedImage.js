// src/components/AnnotatedImage.js

"use client"

import { useRef, useEffect } from "react"

// Render an image with bounding boxes and labels drawn over it on a canvas
export default function AnnotatedImage({ image, boxes, color, title }) {
    const canvasRef = useRef(null)
    const imgRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img) return

        const draw = () => {
            canvas.width = img.naturalWidth
            canvas.height = img.naturalHeight
            const ctx = canvas.getContext("2d")
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            boxes.forEach(box => {
                const [x1, y1, x2, y2] = box.bbox
                ctx.strokeStyle = color
                ctx.lineWidth = 2
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)

                // Label text
                ctx.fillStyle = color
                ctx.font = "16px sans-serif"
                ctx.fillText(box.label, x1, y1 - 4)
            })
        }

        if (img.complete) draw()
        else img.onload = draw

    }, [boxes, color])

    return (
        <div>
            {title && <h3>{title}</h3>}
            <div style={{ position: "relative", display: "inline-block" }}>
                <img
                    ref={imgRef}
                    src={`data:image/jpeg;base64,${image}`}
                    alt={title}
                    style={{ display: "block", maxWidth: "100%" }}
                />
                <canvas
                    ref={canvasRef}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                />
            </div>
        </div>
    )
}