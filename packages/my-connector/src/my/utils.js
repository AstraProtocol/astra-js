export function generateUUID() {
  let d = new Date().getTime();
  let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; // Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16; // random number between 0 and 16
    if (d > 0) {
      // Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      // Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const miniAppMessage = (target, callback) => {
  const id = generateUUID();
  const onMessage = (event) => {
    const { data } = event;
    if (data && data.id && data.id === id) {
      release();
      callback(data.error, data.data);
    }
  };
  const postMessage = async (value) => {
    try {
      const my = await getMy(target, 100);
      if (my) return my.postMessage({ ...value, id });
      throw new Error('Not supported platform!');
    } catch (e) {
      callback(e);
    }
  };
  const delay = (time) => new Promise((resolve) => setTimeout(resolve, time));
  const getMy = async (target, time) => {
    if (target.my) return target.my;
    if (!time) return Promise.reject('Not supported platform!');
    await delay(16);
    return getMy(target, time - 1);
  };

  target.addEventListener('message', onMessage);

  const release = () => {
    target.removeEventListener('message', onMessage);
  };
  return {
    postMessage,
  };
};

export const promiseAppMessage = (target) => {
  return (payload) =>
    new Promise((resolve, reject) => {
      miniAppMessage(target, function resolveCallback(error, data) {
        if (error) return reject(error);
        resolve(data);
      }).postMessage(payload);
    });
};
