export const normalizeCoord = (
  coord: number | string,
  fake: number,
  real: number
) => {
  return Math.round((+coord / fake) * real);
};

export default normalizeCoord;
