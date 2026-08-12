export default function Buttons({
  startListening,
  resetUser,
}) {
  return (
    <div className="igris-buttons">

      <button
        className="igris-btn primary"
        onClick={() => startListening("question")}
      >
        TALK TO IGRIS
      </button>

      <button
        className="igris-btn"
        onClick={resetUser}
      >
        RESET
      </button>

    </div>
  );
}