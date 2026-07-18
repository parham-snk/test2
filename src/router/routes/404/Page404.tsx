import { Link } from "react-router-dom";

export default function Page404(){

    return (
        <div className="flex flex-col justify-center align-middle items-center bg-zinc-800 text-white h-screen">
            <h1 className="text-7xl font-bold">404</h1>
            <p className="text-xl mt-8">page not found!</p>
            <Link to={"/dashboard"} className="bg-white text-black px-3 py-2 mt-5 rounded shadow hover:text-white hover:bg-transparent transition-all border border-white">Home</Link>
        </div>
    )
}