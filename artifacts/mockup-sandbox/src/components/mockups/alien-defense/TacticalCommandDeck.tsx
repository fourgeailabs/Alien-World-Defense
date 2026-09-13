import { useState } from "react";
import {
  Activity,
  Crosshair,
  Gauge,
  Map,
  Radio,
  Shield,
  Sparkles,
  Swords,
  Target,
  Users,
  Zap,
} from "lucide-react";
import "./TacticalCommandDeck.css";

type Sector = {
  name: string;
  code: string;
  threat: string;
  threatLevel: number;
  color: string;
  copy: string;
};

const sectors: Sector[] = [
  { name: "Nyxara Horizon", code: "SECTOR 04", threat: "Critical", threatLevel: 92, color: "#ff7f61", copy: "Three walker signatures crossing the western ridge." },
  { name: "Lumen Reach", code: "SECTOR 09", threat: "Watch", threatLevel: 48, color: "#f6c65b", copy: "Signal bloom detected beneath the ice shelf." },
  { name: "Verdant Halo", code: "SECTOR 12", threat: "Clear", threatLevel: 16, color: "#40d8c0", copy: "No hostile movement in the canopy corridor." },
];

export function TacticalCommandDeck() {
  const [selected, setSelected] = useState(0);
  const [activeTab, setActiveTab] = useState<"map" | "squad">("map");
  const [deployed, setDeployed] = useState(false);
  const sector = sectors[selected];

  return (
    <main className="tcd-shell">
      <div className="tcd-noise" />
      <header className="tcd-header">
        <div className="tcd-brand">
          <div className="tcd-mark"><Crosshair size={18} strokeWidth={1.7} /></div>
          <div><strong>ORBITAL DEFENSE</strong><span>COMMAND DECK / 07</span></div>
        </div>
        <div className="tcd-signal"><span className="tcd-live-dot" />LINK STABLE <Radio size={14} /></div>
      </header>

      <section className="tcd-brief">
        <div>
          <p className="tcd-eyebrow">WED · 16:40 UCT <span>•</span> OPERATION 01</p>
          <h1>Hold the<br /><em>line.</em></h1>
        </div>
        <div className="tcd-clock"><span>MISSION CLOCK</span><b>02:14:38</b><small>UNTIL REINFORCEMENT WINDOW</small></div>
      </section>

      <nav className="tcd-tabs" aria-label="Deck views">
        <button className={activeTab === "map" ? "is-active" : ""} onClick={() => setActiveTab("map")}><Map size={16} /> THEATER MAP</button>
        <button className={activeTab === "squad" ? "is-active" : ""} onClick={() => setActiveTab("squad")}><Users size={16} /> SQUAD READINESS</button>
      </nav>

      {activeTab === "map" ? (
        <>
          <section className="tcd-map-card">
            <div className="tcd-map-top"><span>LIVE TACTICAL OVERLAY</span><span className="tcd-coords">18° 42′ N / 74° 10′ W</span></div>
            <div className="tcd-map">
              <div className="tcd-orbit orbit-one" /><div className="tcd-orbit orbit-two" />
              <div className="tcd-crosshair cross-one" /><div className="tcd-crosshair cross-two" />
              <div className="tcd-route route-one" /><div className="tcd-route route-two" />
              {sectors.map((item, index) => (
                <button key={item.name} className={`tcd-node node-${index} ${selected === index ? "selected" : ""}`} onClick={() => setSelected(index)} aria-label={`Select ${item.name}`}>
                  <span className="tcd-node-pulse" style={{ background: item.color }} /><b>{String(index + 1).padStart(2, "0")}</b>
                </button>
              ))}
              <div className="tcd-map-center"><Sparkles size={17} /><span>AEGIS<br />ARRAY</span></div>
              <div className="tcd-map-legend"><span><i className="dot teal" /> FRIENDLY</span><span><i className="dot orange" /> HOSTILE</span></div>
            </div>
          </section>

          <section className="tcd-sector-panel">
            <div className="tcd-panel-heading"><div><span className="tcd-eyebrow">{sector.code}</span><h2>{sector.name}</h2></div><span className="tcd-threat" style={{ color: sector.color, borderColor: `${sector.color}66` }}>{sector.threat.toUpperCase()}</span></div>
            <p className="tcd-copy">{sector.copy}</p>
            <div className="tcd-threat-meter"><div><span>THREAT INDEX</span><strong>{sector.threatLevel}<small>/100</small></strong></div><div className="meter"><i style={{ width: `${sector.threatLevel}%`, background: sector.color }} /></div></div>
            <div className="tcd-actions"><button className="tcd-secondary"><Activity size={16} /> VIEW SIGNALS</button><button className={`tcd-primary ${deployed ? "deployed" : ""}`} onClick={() => setDeployed(!deployed)}>{deployed ? <><Shield size={16} /> UNIT DEPLOYED</> : <><Swords size={16} /> DEPLOY UNIT</>}</button></div>
          </section>
        </>
      ) : (
        <section className="tcd-roster">
          <div className="tcd-roster-head"><div><span className="tcd-eyebrow">ACTIVE PERSONNEL</span><h2>Squad readiness</h2></div><span className="tcd-ready"><i /> 4 OF 4 READY</span></div>
          {["Vega / Scout", "Orion / Heavy", "Sable / Medic", "Kite / Engineer"].map((name, index) => (
            <div className="tcd-soldier" key={name}><div className="tcd-avatar">{["VE", "OR", "SA", "KI"][index]}</div><div><strong>{name}</strong><span>{index === 1 ? "Breach specialist" : index === 2 ? "Field support" : "Forward unit"}</span></div><div className="tcd-bar"><i style={{ width: `${[88, 74, 96, 81][index]}%` }} /></div><b>{[88, 74, 96, 81][index]}%</b></div>
          ))}
          <button className="tcd-primary full" onClick={() => setDeployed(!deployed)}><Zap size={16} /> {deployed ? "SQUAD STANDING BY" : "ARM SQUAD FOR DEPLOYMENT"}</button>
        </section>
      )}

      <footer className="tcd-footer"><span><Gauge size={14} /> SYSTEM LOAD <b>32%</b></span><span>LAST PING <b>0.8s</b></span><span>BUILD 1.04.7</span></footer>
    </main>
  );
}
