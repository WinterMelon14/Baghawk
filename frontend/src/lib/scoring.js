/**
 * Calculate the Intersection over Union (IoU) of two bounding boxes.
 * @param {Array<number>} boxA - First bounding box in the format of [x1, y1, x2, y2]
 * @param {Array<number>} boxB - Second bounding box in the format of [x1, y1, x2, y2]
 * @returns {number} - IoU value of the two bounding boxes
 */
const iou = (boxA, boxB) => {
    const xA = Math.max(boxA[0], boxB[0]);
    const yA = Math.max(boxA[1], boxB[1]);
    const xB = Math.min(boxA[2], boxB[2]);
    const yB = Math.min(boxA[3], boxB[3]);

    const interArea = Math.max(0, xB - xA) * Math.max(0, yB - yA);
    if (interArea === 0) return 0;

    const boxAArea = (boxA[2] - boxA[0]) * (boxA[3] - boxA[1]);
    const boxBArea = (boxB[2] - boxB[0]) * (boxB[3] - boxB[1]);

    return interArea / (boxAArea + boxBArea - interArea);
}
 
/**
 * Calculate a score based on IoU and label correctness.
 * The score is calculated as follows: Math.round(Math.atanh(iou - 0.001) * 0.7 * (g + 0.4), 2)
 * Where g is 1 if the label is correct and 0 otherwise.
 * @param {number} iou - Intersection over Union (IoU) of two bounding boxes
 * @param {boolean} labelCorrect - Whether the label is correct or not
 * @returns {number} - Score based on IoU and label correctness
 */
const boxScore = (iou, labelCorrect) => {
    const g = labelCorrect ? 1 : 0;
    return Math.round(Math.atanh(iou - 0.001) * 0.7 * (g + 0.4) * 100) / 100;
}


/**
 * Calculate a score based on Intersection over Union (IoU) and label correctness.
 * The score is calculated as follows: total score is the sum of boxScore for each ground truth box divided by the number of ground truth boxes.
 * @param {Array<{label: string, bbox: Array<number>}>} predictions - Predicted bounding boxes with labels
 * @param {Array<{label: string, bbox: Array<number>}>} groundTruths - Ground truth bounding boxes with labels
 * @returns {number} - Score based on IoU and label correctness
 */
export default function score(predictions, groundTruths) {
    if (groundTruths.length === 0) return 0;

    const used = new Set();
    let total = 0;
    // Use greedy matching to match predicted boxes with best IoU against ground truth boxes
    for (const gt of groundTruths) {
        let bestIou = 0;
        let bestIdx = -1;

        for (let i = 0; i < predictions.length; i++) {
            if (used.has(i)) continue;
            const boxIou = iou(predictions[i].bbox, gt.bbox);
            if (boxIou > bestIou) {
                bestIou = boxIou;
                bestIdx = i;
            }
        }

        if (bestIdx !== -1) {
            used.add(bestIdx);
            const labelCorrect = predictions[bestIdx].label === gt.label;

            total += boxScore(bestIou, labelCorrect);
        }
        // missed gt box adds 0 implicitly
        // extra predicted boxes that never matched, add 0 implicitly
    }

    return total / groundTruths.length; // The average score over all ground truth boxes handles the fact that missed boxes are a 0
    // It also prevents against spamming extra boxes, since the score will never get inflated due to the denominator being fixed to the ground truth length
}
