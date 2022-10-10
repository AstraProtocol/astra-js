import { Select } from "antd";
import { useEffect, useState } from "react";
import axios from 'axios';

const ValidatorSelect = ({
  api,
  onChange
}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  
  useEffect(() => {
    setLoading(true);
    axios.get(`${api}/staking/validators`)
    .then(res => {
      setData(res?.data?.result || []);
      setLoading(false);
    })
    .catch(e => {
      console.log(e);
    })
  }, [api]);

  return <Select onChange={onChange} loading={loading} >
    {
      data.map(item => <Select.Option value={item.operator_address}>
        {item.description?.moniker}
      </Select.Option>)
    }
  </Select>
};

export default ValidatorSelect