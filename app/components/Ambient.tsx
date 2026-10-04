// Fixed light field behind every page. Liquid glass only reads as glass when
// there is colour behind it to bend, so these slow-moving pools of light are
// what the panels refract.
export default function Ambient() {
  return (
    <div aria-hidden className="ambient">
      <div className="ambient-pool ambient-sapphire" />
      <div className="ambient-pool ambient-champagne" />
      <div className="ambient-pool ambient-lagoon" />
      <div className="ambient-vignette" />
      <div className="ambient-grain" />
    </div>
  );
}
