import "./Core.css";

export default function AICore({ status }) {
  return (
    <div className={`ai-core ${status.toLowerCase()}`}>

      {/* OUTER RINGS */}
      <div className="core-ring ring1"></div>
      <div className="core-ring ring2"></div>
      <div className="core-ring ring3"></div>

      {/* ORBITS */}
      <div className="orbit orbit1">
        <span className="particle"></span>
      </div>

      <div className="orbit orbit2">
        <span className="particle"></span>
      </div>

      <div className="orbit orbit3">
        <span className="particle"></span>
      </div>

      {/* ENERGY CORE */}
      <div className="core-glow"></div>

      <div className="core-center"></div>

      
    </div>
  );
}