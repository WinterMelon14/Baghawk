"use client"
import { useRef, useEffect, useState } from "react"

const CLASSES = [
  "Baton", "Pliers", "Hammer", "Powerbank", "Scissors",
  "Wrench", "Gun", "Bullet", "Sprayer", "HandCuffs", "Knife", "Lighter"
];

const getCanvasPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
    }
}

function drawRect(ctx, box, color){
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1); // strokeRect(x, y, width, height)
}

export default function Drawer({image, drawable, onBoxesChange}){
    const canvasRef = useRef(null);
    const imgRef = useRef(null);
    const [boxes, setBoxes] = useState([]);
    const [drawing, setDrawing] = useState(null); // the current box being drawn

    // Redraw canvas when a box or the drawing in progress changes
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        boxes.forEach((box) => drawRect(ctx, box, "red"));

        if (drawing) drawRect(ctx, drawing, "#f507ed");
        
    }, [boxes, drawing]);

    // Lift state up to parent 
    useEffect(() => {
        onBoxesChange(boxes);
    }, [boxes]);

    // Convert canvas size to match image
    useEffect(() => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!img || !canvas) return;

        const observer = new ResizeObserver(() => {
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
        });
        observer.observe(img);
        return () => observer.disconnect();
    }, [image]);

    // Mousedown should set the start pos of the drawing 
    const handleMouseDown = (e) => {
        if (!drawable) return;
        e.preventDefault();
        const pos = getCanvasPos(e, canvasRef.current);
        setDrawing({x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y});
    }

    // Mousemove should set the end pos of the drawing 
    const handleMouseMove = (e) => {
        if (!drawable || !drawing) return;
        const pos = getCanvasPos(e, canvasRef.current);
        setDrawing(prev => ({ ...prev, x2: pos.x, y2: pos.y }))
    }

    // Mouseup should finalize the rectangle
    const handleMouseUp = (e) => {
        if (!drawing || !drawable) return;

        const pos = getCanvasPos(e, canvasRef.current);
        const newBox = {
            x1: Math.min(drawing.x1, drawing.x2),
            y1: Math.min(drawing.y1, drawing.y2),
            x2: Math.max(drawing.x1, drawing.x2),
            y2: Math.max(drawing.y1, drawing.y2),
            label: CLASSES[0]
        }

        // Ignore tiny accidental clicks that may occur (no object will be this tiny)
        if (Math.abs(newBox.x2 - newBox.x1) < 32 || Math.abs(newBox.y2 - newBox.y1) < 32) {
            setDrawing(null)
            return
        }

        setBoxes(prev => [...prev, newBox]);
        setDrawing(null);
    }

    // Right clicks will delete boxes 
    const handleRightClick = (e) => {
        if (!drawable) return;
        e.preventDefault();
        const pos = getCanvasPos(e, canvasRef.current);

        // Find all boxes containing the click point
        const candidates = boxes.filter(box => 
            pos.x >= box.x1 && pos.x <= box.x2 && 
            pos.y >= box.y1 && pos.y <= box.y2
        );

        if (candidates.length === 0) return;

        // Pick the smallest one by area
        const smallest = candidates.reduce((best, box) => {
            const area = (box.x2 - box.x1) * (box.y2 - box.y1);
            const bestArea = (best.x2 - best.x1) * (best.y2 - best.y1);
            return area < bestArea ? box : best;
        });

        setBoxes(prev => prev.filter(box => box !== smallest));
    }

    // Change the label of a box
    const updateLabel = (i, label) => {
        setBoxes(prev => prev.map((box, idx) => idx === i ? {...box, label} : box));
    }

    // Scale to position dropdowns over canvas (on top of boxes)
    const getScale = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return {x: 1, y: 1};
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / canvas.width;
        const scaleY = rect.height / canvas.height;
        return {x: scaleX, y: scaleY};
    }

    return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <img
        ref={imgRef}
        src={`data:image/jpeg;base64,${image}`}
        alt="xray"
        style={{ display: "block", maxWidth: "100%" }}
        draggable={false}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "100%",
          cursor: drawable ? "crosshair" : "default"
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onContextMenu={handleRightClick}
      />

      {/* Dropdowns positioned over each box */}
      {boxes.map((box, i) => {
        const scale = getScale()
        return (
          <select
            key={i}
            value={box.label}
            onChange={e => updateLabel(i, e.target.value)}
            style={{
              position: "absolute",
              left: box.x1 * scale.x,
              top: box.y1 * scale.y,
              zIndex: 10,
              fontSize: "12px"
            }}
          >
            {CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
          </select>
        )
      })}
    </div>
  )


}