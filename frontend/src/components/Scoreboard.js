export default function Scoreboard({ scores, deltas }) {
    return (
        <div style={{ display: "flex", gap: "40px" }}>
            <div>
                <h3>You</h3>
                <p>{scores.human.toFixed(2)}</p>
                {deltas.human > 0 && <p>+{deltas.human.toFixed(2)}</p>}
            </div>
            <div>
                <h3>Model</h3>
                <p>{scores.model.toFixed(2)}</p>
                {deltas.model > 0 && <p>+{deltas.model.toFixed(2)}</p>}
            </div>
        </div>
    )
}