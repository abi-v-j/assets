import React from "react";
import CustomInput from "../../utilities/inputs/CustomInput"

const Contact: React.FC = () => {
    const [name, setName] = React.useState("");
    const [email, setEmail] = React.useState("");
    const [message, setMessage] = React.useState("");

    console.log(name);
    console.log(email);
    console.log(message);

  return (
    <div>

    <div>Contact</div>
    <CustomInput placeholder="Name"   onChange={(e) => setName(e.target.value)}/><br/>
    <CustomInput placeholder="Email"  onChange={(e) => setEmail(e.target.value)}/><br/>
    <CustomInput placeholder="Message" onChange={(e) => setMessage(e.target.value)}/><br/>
    </div>
  )
}

export default Contact