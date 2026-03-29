export default function Modal({ title, onClose, children }) {
    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100
        }}
            onClick={onClose}
        >
            <div style={{
                background: "#1a1a1a",
                border: "1px solid #333",
                padding: "32px",
                maxWidth: "480px",
                width: "90%",
                position: "relative",
                fontFamily: "monospace"
            }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    style={{
                        position: "absolute",
                        top: "12px", right: "12px",
                        background: "transparent",
                        border: "none",
                        color: "#aaa",
                        fontSize: "18px",
                        cursor: "pointer"
                    }}
                >
                    ✕
                </button>

                {title && (
                    <h2 style={{ fontSize: "16px", letterSpacing: "0.2em", color: "#f0f0f0", margin: "0 0 20px 0" }}>
                        {title}
                    </h2>
                )}

                {children}
            </div>
        </div>
    )
}