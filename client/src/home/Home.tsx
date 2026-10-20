import { Suite } from './Suite';
import { Formats } from './Formats';
import { PointOfView } from './PointOfView';
import { Pipeline } from './Pipeline';
import { Career } from './Career';
import { Education } from './Education';
import { Contact } from './Contact';
import type { CV, LinkTo } from '../types';

export function Home({ cv, linkTo }: { cv: CV; linkTo: LinkTo }) {
  return (
    <>
      <Suite cv={cv} linkTo={linkTo} />
      <Formats linkTo={linkTo} />
      <PointOfView />
      <Pipeline skills={cv.skills} />
      <Career experience={cv.experience} />
      <Education education={cv.education} languages={cv.languages} />
      <Contact cv={cv} />
    </>
  );
}
