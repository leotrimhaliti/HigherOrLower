export const videoData = [];

export const formatViews = (views) => {
  return new Intl.NumberFormat('en-US').format(views);
};

export const getRandomPair = () => {
  const shuffled = [...videoData].sort(() => 0.5 - Math.random());
  return [shuffled[0], shuffled[1]];
};

export const getRandomSet = (count) => {
  const shuffled = [...videoData].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
