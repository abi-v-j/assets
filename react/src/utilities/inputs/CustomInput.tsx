import type { CustomInputProps } from "../../types/landingTypes"


const CustomInput: React.FC<CustomInputProps> = ({ placeholder, onChange }) => {
  return (
    <input type="text" placeholder={placeholder}  onChange={onChange} />
  )
}

export default CustomInput