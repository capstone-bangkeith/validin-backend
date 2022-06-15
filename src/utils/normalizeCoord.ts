export const normalizeCoord = (coord: number | string, multiplier = 3) => {
  return Math.round(+coord * multiplier);
};

export default normalizeCoord;
