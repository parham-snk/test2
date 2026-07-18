import { BrowserRouter,Routes,Route } from "react-router-dom";
import Home from "./routes/home/home";
import Dashboard from "./routes/auth/dashboard";
import Node from "./routes/node/node";
import Page404 from "./routes/404/Page404";

export default function Router(){

    return(
        <BrowserRouter  basename="/test2">
            <Routes  >
                    <Route path="/" Component={Home}/>
                    <Route path="/dashboard" Component={Dashboard}/>
                    <Route path="/node/:node_id" Component={Node}/>
                    <Route path="/*" Component={Page404}/>
            </Routes>
        </BrowserRouter>
    )
}