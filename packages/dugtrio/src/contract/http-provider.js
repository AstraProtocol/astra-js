function createWeb3Provider(rpc, axiosInstance) {
  const provider = {
    send(payload, callback) {
      axiosInstance.post(rpc, payload)
        .then(({ data }) => {
          console.log({payload, data})
          callback(null, data);
        })
        .catch(error => {
          callback(error, null);
        });
    },
    supportsSubscriptions() {
      return;
    },
    supportsSubscriptions() {
      return false;
    }
  };
  return provider;
}
export default createWeb3Provider;