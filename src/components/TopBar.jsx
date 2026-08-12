export default function TopBar({
  status,
  language
}) {
  return (
    <div className="top-bar">

      <span>IGRIS AI SYSTEM</span>

      <span>{status}</span>

      <span>{language}</span>

    </div>
  )
}