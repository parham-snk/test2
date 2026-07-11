import { Session, User } from "@supabase/supabase-js";
import { createContext, useState, useEffect, FC, useContext, ReactComponentElement } from "react";
import supapabase from "../../../supabase";



type context = {
    session?: Session | null
    user?: User | null,
    setSession: (session: Session) => void,
    setUser: (user: User) => void
}
const AuthContext = createContext<context | null>({
    user: null, session: null, setSession(session) {

    }, setUser(user) {

    },
})






const ContextProvider = (props: any) => {

    const [session, setSession] = useState<Session | null>()
    const [user, setUser] = useState<User | null>()



    async function check_Session() {
        const { data, error } = await supapabase.auth.getSession()
        if (error) return;
        setSession(data.session)
        setUser(data.session?.user)
    }
    useEffect(() => {
        check_Session()
        console.log(user, session)
    }, [])
    return<AuthContext.Provider
        value={{
            session,
            user,
            setSession,
            setUser,
        }}
    >
        {props.children!}
    </AuthContext.Provider>
}

export { ContextProvider }


export const useAuth = () => {
    return useContext(AuthContext)
}