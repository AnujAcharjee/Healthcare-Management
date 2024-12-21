/* eslint-disable react/prop-types */
import { useId, forwardRef } from 'react'

function Input({
    label,
    type = "text",
    width = "w-full",
    color="bg-gray-800 text-gray-200",
    className = "",
    ...props
}, ref) {
    const id = useId()
    return (
        <div className='w-full'>
            {label && <label
                className='inline-block mb-1 pl-1'
                htmlFor={id}>
                {label}
            </label>
            }
            <input
                type={type}

                className={`px-3 text-sm py-1 mb-2 space-y-2 border-2 border-transparent rounded-lg focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500 transition-colors hover:border-teal-400 duration-300 ease ${className}  ${width} ${color}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    )
}

export default forwardRef(Input)