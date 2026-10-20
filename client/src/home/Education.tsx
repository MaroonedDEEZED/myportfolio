import type { CV } from '../types';

export function Education({ education, languages }: { education: CV['education']; languages: CV['languages'] }) {
  return (
    <section className="education section" aria-labelledby="education-title">
      <h2 id="education-title">Formed by the language of frames.</h2>
      <dl className="facts">
        <div className="fact">
          <dt>Education</dt>
          <dd>
            <strong>{education.degree}</strong>
            <span>{education.school}, {education.detail}</span>
            <span>{education.location}</span>
          </dd>
        </div>
        <div className="fact">
          <dt>Languages</dt>
          <dd>
            <ul className="languages">
              {languages.map((language) => (
                <li key={language.label}><strong>{language.label}</strong> <span>{language.detail}</span></li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
