export const normalizeCoord = (coord: number | string) => {
  return Math.round(+coord * 3);
};

export default normalizeCoord;
