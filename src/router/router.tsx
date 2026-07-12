import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./routes/home/home";
import Dashboard from "./routes/auth/dashboard";

export default function Router(){

    return(
        <BrowserRouter basename="/test2">
            <Routes  >
                    <Route path="/" Component={Home}/>
                    <Route path="/dashboard" Component={Dashboard}/>
            </Routes>
        </BrowserRouter>
    )
}