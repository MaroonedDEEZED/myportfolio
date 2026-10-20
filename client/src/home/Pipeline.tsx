import type { CV } from '../types';

type Skill = CV['skills'][number];

// The order work actually moves through one pair of hands: planned, shot, cut and
// graded, scored and mixed. Matched on the label's first word, so a CV served from
// the database with slightly different labels still lands in the chain. The
// software list is a CV detail, not a stage, and stays off the graph.
const CHAIN = ['production', 'cinematography', 'post', 'audio'];
const TOOLS = 'software';

const firstWord = (skill: Skill) => skill.label.toLowerCase().split(/[\s&-]+/)[0];

function splitDetail(detail: string) {
  return detail.split(/\s*·\s*/).filter(Boolean);
}

export function Pipeline({ skills }: { skills: Skill[] }) {
  const rest = skills.filter((skill) => firstWord(skill) !== TOOLS);
  const nodes = [
    ...CHAIN.map((word) => rest.find((skill) => firstWord(skill) === word)).filter((skill): skill is Skill => !!skill),
    ...rest.filter((skill) => !CHAIN.includes(firstWord(skill))),
  ];

  return (
    <section className="pipeline section band" aria-labelledby="pipeline-title">
      <div className="section-head">
        <h2 id="pipeline-title">Wide lens. Deep craft.</h2>
        <p className="section-lede">One practice, many entry points. The work gets stronger when the disciplines speak to one another.</p>
      </div>

      <div className="graph-stage">
        <ol className="graph" aria-label="How a project moves through my hands, in order">
          {nodes.map((skill, index) => (
            <li className="node" key={skill.label}>
              <div className="node-head">
                <span className="node-number data" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                <h3>{skill.label}</h3>
              </div>
              <ul className="node-body">
                {splitDetail(skill.detail).map((item) => <li key={item}>{item}</li>)}
              </ul>
              <span className="port port--in" aria-hidden="true" />
              <span className="port port--out" aria-hidden="true" />
            </li>
          ))}
          <li className="node node--output">
            <div className="node-head">
              <span className="node-number legend" aria-hidden="true">Out</span>
              <h3>Final master</h3>
            </div>
            <p className="node-note">Delivered by the same hands that framed it.</p>
            <span className="port port--in" aria-hidden="true" />
          </li>
        </ol>
      </div>

    </section>
  );
}
