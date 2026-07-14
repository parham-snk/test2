import { Node } from "@xyflow/react"
import { FC, useCallback, useEffect, useState } from "react"
import { useFormState } from "react-dom"
import supapabase from "../../../../supabase"


import { Toaster } from "react-hot-toast"
import { useParams, useSearchParams } from "react-router-dom"
import { useAuth } from "../../home/AuthContext"

type modal = {

    notify: (msg: string, type: "error" | "success") => void,
    data?: Node | null,
    setShowModal: (state: boolean) => void

}

const Add_Node_Page_Modal: FC<modal> = ({ data, notify, setShowModal }) => {



    const { node_id } = useParams<{ node_id: string }>()
    const userID=useAuth()?.user?.id

    let actionType = data ? true : false


    const formAction = async (p: any, formData: FormData) => {
        const parrent_id = formData.get("parrent_id")
        const label = formData.get("label")
        const posx = Number(formData.get("posx")).toFixed(0)
        const posy = Number(formData.get("posy")).toFixed(0)

        async function InsertRow() {
            const { error } = await supapabase.schema("articles").from("nodes").insert({ parrent_id, text: label, posx, posy,auther:userID })
            if (error) {
                return notify("error", "error")
            } else {
                notify("node added!", "success")
            }
        }

        async function updateRow() {
            const { error } = await supapabase.schema("articles").from("nodes").update({ parrent_id, text: label, posx, posy }).eq("id", data?.id)
            if (error) return notify("error", "error");
            notify("node updated!", "success")
        }

        actionType ? updateRow() : InsertRow()

    }


    const [state, formaction, isPending] = useFormState(formAction, null)

    const [node, setnode] = useState<any>(data ? data : null)
    const [parrent_id, setID] = useState(node_id || "")
    const [label, setLabel] = useState(node?.data.label || "")
    const [posx, setPosX] = useState(node?.position.x || 0)
    const [posy, setPosY] = useState(node?.position.y || 0)

    const [dir, setDir] = useState<boolean>(/\w+/.test(label));


    //delete node 
    async function deleteNode() {
        const { error } = await supapabase.schema("articles").from("nodes").delete().eq("id", node.id)
        if (error) {
          return  notify("error", "error")
        }
        notify("node deleted!", "success")
        setShowModal(false)
    }
  

    



    return (
        <div className="bg-zinc-900 bg-opacity-70 backdrop-blur rounded shadow-xl absolute w-80 h-auto  left-16 top-10 z-20">

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
                    //parrent_id
                }
                <label htmlFor="parrent_id" className="py-2">parrent_id : </label>
                <input  type="text" name="parrent_id" id="parrent_id" className="rounded  p-1  bg-transparent border border-white " value={parrent_id} onChange={(e) => {

                    setID(e.target.value)
                }} />
                {
                    //label
                }
                <label htmlFor="label" className="py-2">label : </label>
                <textarea dir={dir ? "ltr" : "rtl"} name="label" rows={10} id="label" className="rounded min-h-32 h-auto  p-2 bg-transparent border border-white " value={label}
                    onChange={e => {
                        setDir(/\w+/.test(label))
                        setLabel(e.target.value)
                    }}
                />
                <fieldset className="border border-white p-2 rounded pb-4 mt-5">
                    <legend className="mt-4">position</legend>
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

                </fieldset>
                {
                    actionType &&
                    <> <input onClick={deleteNode} type="button" className="text-red-500 border border-red-500 rounded hover:bg-red-500 hover:text-black transition-all cursor-pointer
                mt-16 p-1
                " value={"delete node"} />
                        <button type="submit" className="bg-white text-black rounded bottom-0 p-1 mt-2">midify</button></>
                }
                {
                    !actionType &&
                    <button type="submit" className="bg-white text-black rounded bottom-0 p-1 mt-24">create</button>
                }
            </form>
        </div>
    )


}

export default Add_Node_Page_Modal