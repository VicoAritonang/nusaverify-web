// app.jsx — main entry: router + Tweaks
const { useState: useStateA, useEffect: useEffectA } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "motion": "full",
  "layout": "columns",
  "typeset": "default",
  "moodVisible": true,
  "tickerTapeOn": true
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useStateA({ name: "home", id: null });
  const [prefill, setPrefill] = useStateA("");

  // Apply motion + typeset globally via data attributes
  useEffectA(() => {
    document.documentElement.dataset.motion = t.motion;
    document.documentElement.dataset.typeset = t.typeset;
  }, [t.motion, t.typeset]);

  // Scroll to top on route change
  useEffectA(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [route]);

  const handleCardClick = (post) => {
    setRoute({ name: "detail", id: post.id });
  };
  const handleBack = () => setRoute({ name: "home", id: null });
  const handleSubmit = ({ context }) => {
    setPrefill(context);
    setRoute({ name: "detail", id: "g0t0-r3v" });
  };
  const handleLogoClick = () => setRoute({ name: "home", id: null });

  return (
    <div style={{ position: "relative", minHeight: "100vh" }} className="bg-grid">
      {/* Background layers */}
      <div className="bg-radial-top" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }} />
      <div style={{
        position: "fixed", top: 80, left: 40, width: 320, height: 320, borderRadius: "50%",
        background: "rgba(99,102,241,.1)", filter: "blur(100px)", pointerEvents: "none", zIndex: 0,
      }} className="breathe" />
      <div style={{
        position: "fixed", bottom: 80, right: 40, width: 400, height: 400, borderRadius: "50%",
        background: "rgba(139,92,246,.08)", filter: "blur(120px)", pointerEvents: "none", zIndex: 0,
        animationDelay: "2s",
      }} className="breathe" />
      <div style={{
        position: "fixed", top: "50%", left: "50%", width: 280, height: 280, borderRadius: "50%",
        background: "rgba(34,211,238,.04)", filter: "blur(110px)", pointerEvents: "none", zIndex: 0,
        transform: "translate(-50%, -50%)",
      }} className="drift" />

      <div style={{ position: "relative", zIndex: 1 }} data-screen-label={route.name === "home" ? "01 Home" : "02 Detail"}>
        {route.name === "home" ? (
          <HomePage
            onCardClick={handleCardClick}
            onSubmit={handleSubmit}
            layout={t.layout}
            prefill={prefill}
          />
        ) : (
          <DetailPage postId={route.id} onBack={handleBack} />
        )}
      </div>

      <TweaksPanel>
        <TweakSection label="Motion" />
        <TweakRadio
          label="Animation"
          value={t.motion}
          options={["full", "reduce", "off"]}
          onChange={(v) => setTweak("motion", v)}
        />

        <TweakSection label="Layout" />
        <TweakRadio
          label="Posts grid"
          value={t.layout}
          options={["columns", "timeline", "heatmap"]}
          onChange={(v) => setTweak("layout", v)}
        />

        <TweakSection label="Typography" />
        <TweakSelect
          label="Type pairing"
          value={t.typeset}
          options={[
            { label: "Inter + JetBrains Mono", value: "default" },
            { label: "Geist Sans + Geist Mono", value: "alt" },
            { label: "Instrument Serif + IBM Plex Mono", value: "editorial" },
          ]}
          onChange={(v) => setTweak("typeset", v)}
        />
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
