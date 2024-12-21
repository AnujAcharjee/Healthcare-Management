import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();

  const handleNavigation = async (path) => {
    navigate(path);
  };

  return (
    <section className="bg-green-100 h-screen w-full flex items-center justify-center p-8 select-none">
      <div className="mx-auto max-w-screen-xl px-4 lg:flex lg:h-screen lg:items-center">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl animate-fade-in">
            Minimizing wait times,
            <strong className="font-extrabold text-green-600 sm:block">
              {" "}
              maximizing healthcare efficiency.{" "}
            </strong>
          </h1>

          <p className="mt-4 sm:text-xl/relaxed animate-fade-in font-semibold">
            Creating a new system to bring all hospitals together to provide a
            better healthcare system.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">

            <button
              className="block w-full rounded-lg bg-green-500 px-12 py-3 text-sm font-medium text-white shadow hover:bg-green-700 focus:outline-none focus:ring active:bg-green-900 sm:w-auto hover:scale-105 transition duration-300"
              onClick={() => handleNavigation("/user")}
            >
              Patients
            </button>


          </div>
        </div>
      </div>

      <div className="w-full text-[10px] h-20 flex items-center justify-center text-green-900 absolute bottom-0">
        <h1>©Careplus</h1>
      </div>
    </section>
  );
}

export default App;
