import { pathOr } from 'ramda';
const R = { pathOr };

export const fetchAccount = async (axiosInstance, address) => {
  const { data } = await axiosInstance.get(`auth/accounts/${address}`);
  const accountNumber = R.pathOr('0', ['result', 'base_account', 'account_number'], data);
  const sequence = R.pathOr('0', ['result', 'base_account', 'sequence'], data);
  return {
    address,
    accountNumber: `${accountNumber}`,
    sequence: `${sequence}`,
  };
};

export const fetchTransactions = async (axiosInstance, query) => {
  const { data } = await axiosInstance.get('txs', {
    params: query,
  });
  return data;
};
