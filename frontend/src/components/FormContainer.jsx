/* eslint-disable react/prop-types */

function FormContainer({ children, className, classNameInner }) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-200 via-yellow-50 to-yellow-300 p-4 ${className}`}>
      <div className={`bg-gray-900/90 backdrop-blur-md p-6 rounded-lg shadow-stone-800 w-full max-w-md sm:w-11/12 ${classNameInner}`}>
        {children}
      </div>
    </div>
  );
}

export default FormContainer;
