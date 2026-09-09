/**
 * Decorative ASAS wireframe sphere — background accent only.
 * Lightweight SVG + CSS rotation (no 3D libs).
 */
export default function WireframeSphere({className = ''}) {
  return (
    <div
      className={`asas-wire-sphere ${className}`.trim()}
      aria-hidden="true"
    >
      <div className="asas-wire-sphere-spin">
        <svg
          className="asas-wire-sphere-svg"
          viewBox="0 0 400 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer shell */}
          <circle cx="200" cy="200" r="148" className="asas-wire-ring asas-wire-ring--outer" />

          {/* Latitude belts */}
          <ellipse cx="200" cy="200" rx="148" ry="38" className="asas-wire-ring" />
          <ellipse cx="200" cy="200" rx="148" ry="78" className="asas-wire-ring" />
          <ellipse cx="200" cy="200" rx="148" ry="118" className="asas-wire-ring" />

          {/* Longitude meridians */}
          <ellipse cx="200" cy="200" rx="38" ry="148" className="asas-wire-ring" />
          <ellipse cx="200" cy="200" rx="78" ry="148" className="asas-wire-ring" />
          <ellipse cx="200" cy="200" rx="118" ry="148" className="asas-wire-ring" />

          {/* Tilted orbital rings */}
          <ellipse
            cx="200"
            cy="200"
            rx="136"
            ry="52"
            transform="rotate(-28 200 200)"
            className="asas-wire-ring asas-wire-ring--orbit"
          />
          <ellipse
            cx="200"
            cy="200"
            rx="128"
            ry="44"
            transform="rotate(34 200 200)"
            className="asas-wire-ring asas-wire-ring--orbit asas-wire-ring--accent"
          />

          {/* Soft polar guides */}
          <path
            d="M200 52 C248 88 268 140 268 200 C268 260 248 312 200 348"
            className="asas-wire-ring asas-wire-ring--soft"
          />
          <path
            d="M200 52 C152 88 132 140 132 200 C132 260 152 312 200 348"
            className="asas-wire-ring asas-wire-ring--soft"
          />

          {/* Network nodes */}
          <g className="asas-wire-nodes">
            <circle cx="200" cy="52" r="2.2" />
            <circle cx="200" cy="348" r="2.2" />
            <circle cx="52" cy="200" r="2.2" />
            <circle cx="348" cy="200" r="2.2" />
            <circle cx="96" cy="110" r="1.8" />
            <circle cx="304" cy="110" r="1.8" />
            <circle cx="96" cy="290" r="1.8" />
            <circle cx="304" cy="290" r="1.8" />
            <circle cx="148" cy="78" r="1.6" />
            <circle cx="252" cy="78" r="1.6" />
            <circle cx="148" cy="322" r="1.6" />
            <circle cx="252" cy="322" r="1.6" />
            <circle cx="278" cy="168" r="1.7" className="asas-wire-node--accent" />
            <circle cx="122" cy="232" r="1.7" className="asas-wire-node--accent" />
          </g>
        </svg>
      </div>

      {/* Faint counter-rotating halo */}
      <div className="asas-wire-sphere-halo" aria-hidden="true">
        <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          <ellipse
            cx="200"
            cy="200"
            rx="168"
            ry="62"
            transform="rotate(18 200 200)"
            className="asas-wire-ring asas-wire-ring--halo"
          />
          <ellipse
            cx="200"
            cy="200"
            rx="158"
            ry="54"
            transform="rotate(-42 200 200)"
            className="asas-wire-ring asas-wire-ring--halo asas-wire-ring--accent"
          />
        </svg>
      </div>
    </div>
  );
}
