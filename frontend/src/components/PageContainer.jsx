/* eslint-disable react/prop-types */


function PageContainer({children, className}) {
    return (
        <div className={`bg-yellow-50 shadow-xl rounded-lg max-w-4xl transition-transform transform mx-auto pt-2 md:px-6 sm:px-0 sm:py-2 ${className}`}>
            {children}
        </div>
    )
}

export default PageContainer