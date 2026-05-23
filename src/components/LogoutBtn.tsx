import React from 'react'
import Cookies from "js-cookie";
type LogoutBtnProps = {
  // Define any props if needed
  logouthandler: () => void;
  classname?: string;
}
const LogoutBtn = ({ logouthandler, classname  }: LogoutBtnProps) => {
    const removeToken = () => {
        Cookies.remove("token");
        logouthandler();
    }
  return (

    <div>
      <button onClick={removeToken} className={`cursor-pointer m-5 text-xl text-white  border border-white/10 rounded-lg px-3 py-2 bg-black/50 backdrop-blur transition-all  duration-300 hover:bg-red-600/70 ${classname || ''}`}>
        Logout
      </button>
    </div>
  )
}

export default LogoutBtn
