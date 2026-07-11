import { useActionState, useEffect } from "react"
import supapabase from "../../../supabase"
import { useAuth } from "../home/AuthContext"
import { useNavigate } from "react-router-dom"

export default function Dashboard() {
    const navigate = useNavigate()
    const { user, session, setSession, setUser } = useAuth()!

    const action = async (prev: any, formData: FormData) => {
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        const { data, error } = await supapabase.auth.signInWithPassword({ email, password })

        if (error) {
            console.log(error)
            return "wrong"
        }
        if (data.user && data.session) {
            setUser!(data.user);
            setSession!(data.session)
            navigate("/")
        }

        return "ok"
    }
    const [state, formAction, isPending] = useActionState(action, null)


    console.log(user, session)
    if (session && user) navigate("/")

    return (
        <div className="bg-zinc-900 w-screen h-screen text-white flex flex-col justify-center align-middle items-center">
            <h1 className="text-5xl font-bold select-none">MY MEMMO</h1>
            <form action={formAction} className=" h-auto border-white border-opacity-40 border rounded p-5 my-10 flex flex-col justify-start align-start" style={{ width: 400 }}>
                <h1 className="text-center text-3xl m-10 select-none">login</h1>
                <label htmlFor="email" className="my-2">email : </label>
                <input
                    className="rounded bg-transparent border border-white  border-opacity-30 p-1"
                    type="text" id="email" name="email" />
                <label htmlFor="password" className="my-2">password : </label>
                <input
                    className="rounded bg-transparent border border-white  border-opacity-30 p-1"
                    type="password" id="password" name="password" />

                <button className="bg-white text-black border border-white p-2 my-10 hover:bg-transparent hover:text-white rounded transition-all ">login</button>
            </form>
        </div>
    )
}