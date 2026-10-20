import type { PointerEvent as ReactPointerEvent } from 'react';

// A frame on a desk tilts a few degrees toward the hand that reaches for it. Mouse
// and pen only: on touch there is no hover to answer, and the stylesheet drops the
// tilt entirely for visitors who asked for reduced motion.
const MAX_TILT = 5;

function tilt(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType === 'touch') return;
  const box = event.currentTarget.getBoundingClientRect();
  const x = (event.clientX - box.left) / box.width - 0.5;
  const y = (event.clientY - box.top) / box.height - 0.5;
  event.currentTarget.style.setProperty('--tilt-x', `${(-y * MAX_TILT * 2).toFixed(2)}deg`);
  event.currentTarget.style.setProperty('--tilt-y', `${(x * MAX_TILT * 2).toFixed(2)}deg`);
}

function settle(event: ReactPointerEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty('--tilt-x');
  event.currentTarget.style.removeProperty('--tilt-y');
}

export const tiltHandlers = { onPointerMove: tilt, onPointerLeave: settle };
