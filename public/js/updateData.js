import axios from 'axios';
import {showAlert} from './alerts';

//type is either data or password
export const updateDataPassword=async (data,type)=>{
  try {
    const url= type==='password' ? "http://localhost:3000/api/v1/users/updateMyPassword":
    "http://localhost:3000/api/v1/users/updateMyProfile";
    const res=await axios({
      method:'PATCH',
      url,
      data
    });
    if(res.data.status === 'success')
      showAlert('success',`${type.toUpperCase()} updated Successfully`)
  } catch (err) {
    showAlert('error',err.response.data.message)
  }
}