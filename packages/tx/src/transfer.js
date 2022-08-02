import { signAmino } from './signAmino';
import { genSignDoc, genMessage } from './tx-helper';
import { fetchAccount } from './account';
import { sendTx } from './tx';
import { calculateFee } from './utils';

const signOptions = {
  preferNoSetFee: true,
  preferNoSetMemo: true,
};

const transfer = async (axiosInstance, chainInfo, account, recipient, amount, _memo = '') => {
  const currency = {
    coinMinimalDenom: chainInfo.denom,
    coinDecimals: chainInfo.decimals,
  };

  const fee = calculateFee(chainInfo);

  const { address, ...keys } = account;
  const signDoc = genSignDoc(amount, currency, recipient, _memo, fee, signOptions);

  const _msg = genMessage('cosmos-sdk/MsgSend')(address)(signDoc);
  const { stdFee, memo } = signDoc;
  const _account = await fetchAccount(axiosInstance, address);
  const txRawBytes = signAmino(
    keys,
    [_msg],
    stdFee,
    memo,

    {
      accountNumber: _account.accountNumber,
      sequence: _account.sequence,
      chainId: chainInfo.chainId,
    }
  );
  return sendTx(axiosInstance, txRawBytes);
};

export default transfer;
