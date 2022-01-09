import { useField } from "formik";
import { FC } from "react";

import "./textField.scss";

type InputProps = {
  label: string;
  name: string;
  value?: any;
  type?: "password" | "text";
} & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

export const TextField: FC<InputProps> = ({ label, ...props }) => {
  const [field, meta] = useField(props);

  return (
    <div className='group-input'>
      <label htmlFor={props.id}>{label}</label>
      <input {...field} {...props} />
      <span className='input-error'>
        {meta.touched && meta.error ? (
          <div className='error'>{meta.error}</div>
        ) : null}
      </span>
    </div>
  );
};
