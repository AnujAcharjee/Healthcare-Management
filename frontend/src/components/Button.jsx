/* eslint-disable react/prop-types */

function Button({
    children,
    color = "bg-teal-600 hover:bg-teal-400",
    type = 'button',
    className = '',
    ...props
}) {
    return (
        <button
            type={type}
            className={`px-4 rounded-lg text-white font-semibold  transition-colors duration-300 shadow-md font-sans text-sm ${color}  ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button;
