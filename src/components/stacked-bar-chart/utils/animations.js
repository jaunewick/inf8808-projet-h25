import * as d3 from "d3";

export const TRANSITION_DURATION = 1000;
export const TRANSITION_DELAY = 100;
export const HOVER_DURATION = 200;

export const createTransition = () => {
  return d3.transition().duration(TRANSITION_DURATION).ease(d3.easeBounceOut);
};

export const createHoverTransition = () => {
  return d3.transition().duration(HOVER_DURATION);
};

export const createDelay = (index) => {
  return index * TRANSITION_DELAY;
};
