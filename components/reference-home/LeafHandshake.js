// Equal quadratic segments let the leaf silhouette genuinely morph into fingers.
function outline(points) {
  const middle = (a, b) => `${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2}`;
  return `M ${middle(points.at(-1), points[0])} ` + points.map((point, i) => `Q ${point.join(" ")} ${middle(point, points[(i + 1) % points.length])}`).join(" ") + " Z";
}
const leaf = outline([[4,5],[10,6],[16,8],[22,11],[26,16],[28,22],[29,28],[29,34],[28,39],[25,37],[21,35],[17,32],[13,29],[10,25],[8,21],[6,17],[5,13],[4,10],[4,8],[4,6]]);
const hand = outline([[3,16],[9,17],[15,19],[21,20],[28,22],[30,25],[27,27],[21,26],[27,30],[29,33],[26,35],[20,32],[25,37],[24,40],[21,39],[15,35],[18,39],[15,40],[8,34],[3,30]]);
const shapes = `${leaf};${leaf};${hand};${hand};${hand};${leaf};${leaf}`;
export default function LeafHandshake() {
  return <span className="leaf-handshake" aria-hidden="true">
    <svg viewBox="0 0 64 48" fill="none" focusable="false">
      <g className="leaf-morph-stage">
        <path d={leaf} fill="#246B26"><animate attributeName="d" dur="7s" repeatCount="indefinite" values={shapes} keyTimes="0;.18;.38;.52;.78;.94;1" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1" /></path>
        <path d={leaf} transform="translate(64 0) scale(-1 1)" fill="#8ABB19"><animate attributeName="d" dur="7s" repeatCount="indefinite" values={shapes} keyTimes="0;.18;.38;.52;.78;.94;1" calcMode="spline" keySplines=".4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1;.4 0 .2 1" /></path>
        <g className="leaf-morph-veins" stroke="#F1F8DF" strokeWidth="1.5" strokeLinecap="round"><path d="M11 13Q23 22 28 36" /><path d="M53 13Q41 22 36 36" /></g>
      </g>
      <g className="leaf-clasp-stage" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 16 10 11 24 13 34 21 46 32Q48 35 45 37Q43 39 40 36L29 27 39 36Q41 39 38 40Q36 41 33 38L24 31 32 38Q34 41 31 42Q29 43 27 40L18 33 10 29 2 26Z" fill="#246B26" />
        <path d="m62 16-8-5-13 1-8 3-9 8Q22 26 25 28Q28 30 31 27l5-4 10 9 8-5 8-1Z" fill="#8ABB19" />
        <path d="m18 30-3 3q-3 3 0 5t5-1l3-3q2-3-1-4t-4 0Zm5 4-3 3q-3 3 0 5t5-1l3-3q2-3-1-4t-4 0Zm5 4-2 2q-2 2 0 4t4-1l2-2q2-2 0-3t-4 0Z" fill="#8ABB19" />
        <g className="leaf-clasp-spark" stroke="#729B35" strokeWidth="2.4"><path d="M32 3v4M22 5l2 3M42 5l-2 3" /></g>
      </g>
    </svg>
  </span>;
}
