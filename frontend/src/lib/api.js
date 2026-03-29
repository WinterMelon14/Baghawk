const FAST_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"


export async function getImage(){
    const res = await fetch(`${FAST_URL}/image`)

    if (!res.ok) {
        throw new Error("Failed to fetch image")
    }

    return res.json()
}

export async function predict(imgId, confidence = 0.4){
    const res = await fetch(`${FAST_URL}/predict`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({img_id: imgId, confidence})
    })

    if (!res.ok) {
        throw new Error("Failed to predict")
    }

    return res.json() // {img bytes, detections, ground truth}
}