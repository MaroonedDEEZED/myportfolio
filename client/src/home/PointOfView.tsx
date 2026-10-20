export function PointOfView() {
  return (
    <section className="pov section" id="practice" aria-labelledby="pov-title">
      <figure className="pov-portrait">
        <div className="pov-portrait-glass">
          <img src="/myimage.jpeg" alt="Portrait of Marouane Bouakba" width={400} height={400} loading="lazy" decoding="async" />
        </div>
        <figcaption>Marouane Bouakba, Doha</figcaption>
      </figure>
      <div className="pov-copy">
        <h2 id="pov-title">The frame is only the beginning.</h2>
        <p className="lead">Every project has a frequency. I find it in the rhythm of a cut, the weight of a room, the detail hiding in plain sight.</p>
        <p className="body-copy">From production floor to final mix, I bring a practical eye and a composed hand to image-making. Cinema, commercial, documentary, brand worlds: the medium shifts. The attention stays.</p>
      </div>
    </section>
  );
}
