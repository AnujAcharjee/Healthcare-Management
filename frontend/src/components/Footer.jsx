import { Link } from "react-router-dom";
import XIcon from '@mui/icons-material/X';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';

const Footer = () => {
    return (
        <footer className="py-8 px-2 bg-lime-200 rounded-b-lg  shadow-xl border-t-2 border-lime-300 ">
            <div className="mx-auto max-w-screen-xl">
                <div className="md:flex md:justify-between">
                    <div className="mb-6 md:mb-0 ">
                        <Link to="#" className="flex items-center">
                            <span className="self-center text-2xl font-sans whitespace-nowrap text-slate-600">
                                Careplus
                            </span>
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase ">
                                Resources
                            </h2>
                            <ul className="text-gray-600 dark:text-gray-400">
                                <li className="mb-4">
                                    <Link to="#" className="hover:underline">
                                        Careplus
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase ">
                                Follow us
                            </h2>
                            <ul className="text-gray-600 dark:text-gray-400">
                                <li className="mb-4">
                                    <Link
                                        to="https://github.com/AnujAcharjee"
                                        className="hover:underline"
                                    >
                                        Github
                                    </Link>

                                </li>
                                <li>
                                    <Link
                                        to="#"
                                        className="hover:underline"
                                    >
                                        Discord
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h2 className="mb-6 text-sm font-semibold text-gray-900 uppercase">
                                Legal
                            </h2>
                            <ul className="text-gray-600 dark:text-gray-400">
                                <li className="mb-4">
                                    <Link to="#" className="hover:underline">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link to="#" className="hover:underline">
                                        Terms &amp; Conditions
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <hr className="my-6 border-lime-500  sm:mx-auto lg:my-8" />
                <div className="sm:flex sm:items-center sm:justify-between">
                    <span className="text-sm text-gray-500 sm:text-center dark:text-gray-600">
                        © 2022{" "}
                        <Link to="#" className="hover:underline">
                            Careplus™
                        </Link>
                        . All Rights Reserved.
                    </span>
                    <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
                        <Link to="https://x.com/CodingAJ" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <XIcon />
                        </Link>
                        <Link to="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <InstagramIcon />
                        </Link>
                        <Link to="#" className="text-gray-500 hover:text-gray-900 dark:hover:text-white">
                            <FacebookIcon />
                        </Link>
                    </div>
                </div>
            </div>
        </footer >
    );
};

export default Footer;
