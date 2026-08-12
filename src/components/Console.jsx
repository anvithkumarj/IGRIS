export default function Console({ transcript, answer }) {
  return (
    <div className="console">

      <h3>COMMAND CONSOLE</h3>

      <p>
        {transcript
          ? transcript
          : answer
          ? answer
          : "Awaiting command..."}
      </p>

    </div>
  );
}