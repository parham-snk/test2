import { Node } from "@xyflow/react"
import { FC, useState } from "react"
import { useFormState } from "react-dom"
import supapabase from "../../../../supabase"

type modal = {

    notify: (msg: string, type: "error" | "success") => void,
    data?: Node | null

}



const ADD_NODE_MODAL: FC<modal> = ({ notify, data }) => {

    let actionType = data ? true : false
    console.log(actionType)
    const formAction = async (p: any, formData: FormData) => {
        const id = formData.get("id")
        const label = formData.get("label")
        const posx = Number(formData.get("posx")).toFixed()
        const posy = Number(formData.get("posy")).toFixed(0)

        async function InsertRow() {
            const { error } = await supapabase.from("nodes").insert({ id, label, posx, posy })
            if (error) {
                return notify("error", "error")
            } else {
                notify("node added!", "success")
            }
        }

        async function updateRow() {
            const {error}=await supapabase.from("nodes").update({id,label,posx,posy}).eq("id",id)
            if(error) return notify("error", "error");
            notify("node updated!","success")
        }

        actionType ? updateRow() : InsertRow()

    }
    const [state, formaction, isPending] = useFormState(formAction, null)

    const [node, setnode] = useState<any>(data ? data : null)
    const [id, setID] = useState(node?.id || "")
    const [label, setLabel] = useState(node?.data.label || "")
    const [posx, setPosX] = useState(node?.position.x || "")
    const [posy, setPosY] = useState(node?.position.y || "")
    return (
        <div className="bg-zinc-900 bg-opacity-70 backdrop-blur rounded shadow absolute w-80 h-96  left-16 top-10 z-20 ">
            {
                isPending &&
                <div className="w-full h-full bg-zinc-900 bg-opacity-80 backdrop-blur  z-50 absolute
                flex justify-center items-center align-middle
                ">
                    <p className="text-white text-xl">please wait!</p>
                </div>
            }
            <form action={formaction} className="flex flex-col justify-start align-baseline p-3 text-white relative h-full">
                {
                    //id
                }
                <label htmlFor="id" className="py-2">id : </label>
                <input type="text" name="id" id="id" className="rounded  p-1  bg-transparent border border-white " value={id} onChange={(e) => {

                    setID(e.target.value)
                }} />
                {
                    //label
                }
                <label htmlFor="label" className="py-2">label : </label>
                <input type="text" name="label" id="label" className="rounded  p-1 bg-transparent border border-white " value={label}
                    onChange={e => {
                        setLabel(e.target.value)
                    }}
                />
                <label htmlFor="" className="mt-4">position</label>
                <div className="flex flex-row justify-between align-middle">
                    <div className="flex flex-row justify-start align-middle items-center w-1/2 pe-2 mt-2">
                        <label htmlFor="posx"> x</label>
                        <input name="posx" id="posx" type="number" className="w-1/2 rounded  mx-2 p-1 bg-transparent border border-white text-xs"
                            value={posx}
                            onChange={e => {
                                setPosX(e.target.value)
                            }}
                        />
                    </div>
                    <div className="flex flex-row justify-start align-middle items-center w-1/2 pe-2 mt-2">

                        <label htmlFor="posy"> y</label>
                        <input name="posy" id="posy" type="number" className="w-1/2 rounded  mx-2 p-1 bg-transparent border border-white text-xs"
                            value={posy}
                            onChange={e => {
                                setPosY(e.target.value)
                            }}
                        />
                    </div>
                </div>
                <button type="submit" className="bg-white text-black rounded bottom-0 p-1 mt-24">create</button>
            </form>
        </div>
    )
}

export default ADD_NODE_MODAL