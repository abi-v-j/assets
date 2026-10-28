import type { CustomButtonProps } from "../../types/authType"
 
const CustomButton: React.FC<CustomButtonProps> = ({ name, onClick }) => {
  return (
    <button onClick={onClick}>{name}</button>
  )
}

export default CustomButton