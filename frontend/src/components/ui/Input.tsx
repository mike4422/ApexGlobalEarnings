import { InputHTMLAttributes } from 'react';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        'w-full rounded-md border border-gray-700 bg-black/40 px-2 py-1.5 text-xs sm:text-sm outline-none focus:border-accentGold ' +
        (props.className || '')
      }
    />
  );
}

export default Input;
