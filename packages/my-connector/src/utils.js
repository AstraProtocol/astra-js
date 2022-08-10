const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
const getContext = (target) => {
  if (target.my) return { isMy: true, isAstra: false };
  if (target.astra) return { isMy: false, isAstra: true };
  return null;
}
export const checkContext = async (target, time = 100) => {
  const context = getContext(target);
  if (context) return context;
  if (!time) return Promise.reject('Not supported platform!');
  await delay(16);
  return checkContext(target, time - 1);
}

