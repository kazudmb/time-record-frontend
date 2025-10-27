import * as React from "react"
import { clsx } from "clsx"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({ className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
        "bg-black text-white hover:bg-neutral-800 h-9 px-4 py-2",
        className
      )}
      {...props}
    />
  )
}

