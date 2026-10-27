import { useState } from "react";
import { team as defaultTeam } from "../data";

const departments = [
  { id: "executive", label: "Executive office", note: "President · Vice President · HR" },
  { id: "technical", label: "Technical department", note: "Build · Test · Ship" },
  { id: "marketing-design", label: "Marketing & design", note: "Strategy · Identity · Visuals" },
  { id: "communication", label: "Communication department", note: "Connect · Speak · Inspire" },
  { id: "events-organisation", label: "Events & organisation", note: "Plan · Coordinate · Deliver" },
];

function TeamCard({ member }) {
  const [flipped, setFlipped] = useState(false);
  const toggle = () => setFlipped(value => !value);
  const cardColor = (member.color || "#4285f4").trim();
  const cardInk = cardColor.toLowerCase() === "#fbbc05" ? "#0e0f12" : "#ffffff";

  return <article
    className={`team-card${flipped ? " flipped" : ""}${member.image ? " has-image" : ""}${member.featured ? " featured" : ""}`}
    tabIndex="0"
    role="button"
    aria-pressed={flipped}
    aria-label={`${member.name}, ${member.role}. Press to view details.`}
    onClick={toggle}
    onKeyDown={event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggle();
      }
    }}
  >
    <div className="team-card-inner">
      <div className="team-front" style={{ "--card-color": cardColor, "--card-ink": cardInk }}>
        <div className="team-portrait">
          {member.image
            ? <img src={member.image} alt={member.name} loading="lazy" />
            : <span className="team-initials" aria-hidden="true">{member.initials}</span>}
        </div>
        <div className="team-card-meta"><div className="team-name">{member.name}</div><div className="team-role">{member.role}</div></div>
      </div>
      <div className="team-back">
        <div><span className="team-back-label">Meet the team</span><strong>{member.role}</strong><p>{member.name} helps turn club ideas into experiences the whole community can grow from.</p></div>
        <div className="socials">
          {member.linkedin_url ? (
            <a href={member.linkedin_url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} aria-label={`${member.name} on LinkedIn`}>in</a>
          ) : (
            <span style={{ opacity: 0.35, cursor: "default" }} title="No LinkedIn provided">in</span>
          )}
          {member.email ? (
            <a href={`mailto:${member.email}`} onClick={e => e.stopPropagation()} aria-label={`Email ${member.name}`}>@</a>
          ) : (
            <span style={{ opacity: 0.35, cursor: "default" }} title="No email provided">@</span>
          )}
        </div>
      </div>
    </div>
  </article>;
}

export default function TeamSection({ team = defaultTeam }) {
  return <section className="team-section" id="team" data-section="People">
    <div className="shell">
      <div className="section-head"><div><span className="eyebrow">The office</span><h2 className="section-title">People who move<br />the club forward.</h2></div><p className="section-copy">Students, makers and connectors creating room for everyone to contribute. Meet the organizers moving the club forward.</p></div>
      <div className="team-hierarchy" id="team-grid">
        {departments.map(department => {
          const members = team.filter(member => member.department === department.id);
          if (members.length === 0) return null;
          return <div className={`team-tier team-department team-department-${department.id}`} key={department.id}>
            <div className="team-tier-head"><span>{department.label}</span><i /><small>{department.note}</small></div>
            <div className="team-row">{members.map(member => <TeamCard member={member} key={`${member.name}-${member.role}`} />)}</div>
          </div>;
        })}
      </div>
    </div>
  </section>;
}
