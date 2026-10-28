import { useState } from "react";
import  CustomButton from "../../utilities/buttons/CustomButton"
import CustomInput from "../../utilities/inputs/CustomInput"
import { authenticateUser } from "../../api/auth";

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const handleLogin = () => {
       authenticateUser({ email, password })
    }

  return (
    <div>
        <h1>Login Page</h1>
        <CustomInput placeholder="Enter Your Email" onChange={(e)=>setEmail(e.target.value)}/><br/>
        <CustomInput placeholder="Enter Your Password" onChange={(e)=>setPassword(e.target.value)}/><br/>
        <CustomButton name="Login" onClick={handleLogin} />

    </div>
  )
}

export default Login