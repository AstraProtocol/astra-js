function createProvider(rpc, axiosInstance) {
  const provider = {
    send(payload, callback) {
      axiosInstance.post(rpc, payload)
      .then(({ data }) => {
          console.log(payload, data)
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
module.exports = createProvider;
// export default createProvider;