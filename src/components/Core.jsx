import "./Core.css";

export default function Core({ status }) {

  return (

    <div className="core">

      <div className="core-glow"></div>

      <div className="brain-shell"></div>

      <div className="brain-grid"></div>

      <div className="brain-light"></div>

      <div className="pulse-ring pulse1"></div>
      <div className="pulse-ring pulse2"></div>

      <div className="energy e1"></div>
      <div className="energy e2"></div>
      <div className="energy e3"></div>
      <div className="energy e4"></div>

      <div className="center-core"></div>

      <div className="status-text">

        {status}

      </div>

    </div>

  );

}