import "./HUD.css";
import Core from "./Core";

export default function HUD({ status }) {

  return (

    <div className="hud">

      <div className="hud-ring ring1"></div>
      <div className="hud-ring ring2"></div>
      <div className="hud-ring ring3"></div>
      <div className="hud-ring ring4"></div>
      <div className="hud-ring ring5"></div>

      <div className="orbit orbit1"></div>
      <div className="orbit orbit2"></div>

      <div className="scan-line"></div>

      <Core status={status}/>

      <div className="particle p1"></div>
      <div className="particle p2"></div>
      <div className="particle p3"></div>
      <div className="particle p4"></div>
      <div className="particle p5"></div>


    </div>

  );

}