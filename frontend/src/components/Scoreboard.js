export default function Scoreboard({ scores, deltas }) {
    return (
        <div style={{ display: "flex", gap: "48px", marginTop: "24px" }}>
            <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "17px", letterSpacing: "0.2em", color: "#aaa", margin: "0 0 4px 0" }}>YOU</p>
                <p style={{ fontSize: "36px", fontWeight: "bold", color: "#f0f0f0", margin: 0 }}>
                    {scores.human.toFixed(2)}
                </p>
                {deltas.human > 0 && (
                    <p style={{ fontSize: "14px", color: "#4ade80", margin: "4px 0 0 0" }}>
                        +{deltas.human.toFixed(2)}
                    </p>
                )}
            </div>

            <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "17px", letterSpacing: "0.2em", color: "#aaa", margin: "0 0 4px 0" }}>MODEL</p>
                <p style={{ fontSize: "36px", fontWeight: "bold", color: "#f0f0f0", margin: 0 }}>
                    {scores.model.toFixed(2)}
                </p>
                {deltas.model > 0 && (
                    <p style={{ fontSize: "14px", color: "#4ade80", margin: "4px 0 0 0" }}>
                        +{deltas.model.toFixed(2)}
                    </p>
                )}
            </div>
        </div>
    )
}