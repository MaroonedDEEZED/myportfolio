import { pad } from '../media';
import type { Experience } from '../types';

export function Career({ experience }: { experience: Experience[] }) {
  // The cities the career has worked in, in the order it reached them.
  const cities = [...new Set([...experience].reverse().map((role) => role.location.split(',')[0].trim()))];

  return (
    <section className="career section" id="career" aria-labelledby="career-title">
      <div className="section-head">
        <h2 id="career-title">Seven years on set and in the suite.</h2>
        <p className="section-lede">{experience.length} roles across {cities.join(' and ')}, from sound on broadcast television to owning a campaign from brief to master.</p>
      </div>

      <ol className="roles">
        {experience.map((item, index) => (
          <li className="role" id={`role-${index + 1}`} key={`${item.company}-${item.dates}`}>
            <p className="role-when">
              <span className="data role-number">{pad(index + 1)}</span>
              <span className="data">{item.dates}</span>
            </p>
            <div className="role-main">
              <h3>{item.company}</h3>
              <p className="role-title">{item.role}</p>
              <p className="role-focus">{item.focus}</p>
              <ul>{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>
            </div>
            <p className="role-where">{item.location}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
