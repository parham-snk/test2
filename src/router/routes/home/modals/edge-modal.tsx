import { Edge } from "@xyflow/react"
import { FC, useEffect, useState } from "react"
import { useFormState } from "react-dom";

import { IoCloseSharp } from "react-icons/io5";
import supapabase from "../../../../supabase";


type modal = {
    edge: Edge,
    position: {
        clientX: number,
        clientY: number
    }
    notify: (msg: string, type: "success" | "error") => void,
    setShowModal: (state: boolean) => void
}


const Edge_Modal: FC<modal> = ({ edge, notify, position, setShowModal }) => {


    const [id, setId] = useState<string | null>(edge.id)
    const [source, setSource] = useState<string | null>(edge.source)
    const [target, setTarget] = useState<string | null>(edge.target)
    const [animated, setAnimated] = useState<boolean | null>(edge.animated as boolean)

    async function FormAction(pre:any,formData:FormData) {
        const id=formData.get("id")
        const source=formData.get("source")! as string
        const target=formData.get("target")! as string
        const animated=formData.get("animated")! as string

        const {error}=await supapabase.from("edges").update({id,source,target,animated}).eq("id",id)
        if(error) return notify("error","error");
        notify("edge updated","success")
    }

    async function delete_edge(){
        const {error}=await supapabase.from("edges").delete().eq("id",id)
        if(error) return notify("error","error");
        notify("edge deleted!","success")
        setShowModal(false)
    }
    const [state, formaction, isPending] = useFormState(FormAction, null)

    return <div className="fixed bg-zinc-900 bg-opacity-80 backdrop-blur rounded shadow-2xl w-80 py-2 h-96
flex flex-col justify-start align-middle
" style={{ left: position.clientX, top: position.clientY }}

    >
        <div className="p-2 absolute -top-10 bg-zinc-900 bg-opacity-80 backdrop-blur text-white cursor-pointer" onClick={() => setShowModal(false)}>
            <IoCloseSharp />
        </div>
        <form action={formaction} className="w-full h-full flex flex-col justify-start align-middle p-2 text-white overflow-y-scroll">
        <div className="flex flex-row-reverse justify-between align-middle items-center gap-2 my-2 mb-4">
            <button className="border border-blue-400 text-blue-400 hover:text-black hover:bg-blue-400 transition-all w-1/2 p-1 rounded">save!</button>
            <div className="border text-red-600 border-red-600 hover:bg-red-600 hover:text-black transition-all w-1/2 text-center p-1 rounded cursor-pointer" onClick={delete_edge}>delete</div>
        </div>
            <label htmlFor="id" className="my-1">id :</label>
            <input name="id" id="id" type="text" className="bg-transparent border border-white rounded p-1" value={id as string} />
            <label htmlFor="source" className="my-1">source (id) :</label>
            <input name="source" id="source" type="text" className="bg-transparent border border-white rounded p-1" value={source as string} onChange={e => {
                setId(e.target.value)
            }} />
            <label htmlFor="target" className="my-1">target (id) :</label>
            <input name="target" id="target" type="text" className="bg-transparent border border-white rounded p-1" value={target as string}
                onChange={e => {
                    setTarget(e.target.value)
                }}
            />
            <fieldset className="border border-white p-3 flex justify-between my-2">
                <legend className="px-2">animated </legend>
                <div className="flex flex-row-reverse gap-1">
                    <label className="cursor-pointer" htmlFor="true">true</label>
                    <input className="cursor-pointer" type="radio" value={"true"} name="animated" id="true" checked={animated ? true : false} onClick={() => setAnimated(true)} />
                </div>
                <div className="flex flex-row-reverse gap-1">
                    <label className="cursor-pointer" htmlFor="false">false</label>
                    <input className="cursor-pointer" type="radio" value={"false"} name="animated" id="false" checked={animated ? false : true} onClick={() => setAnimated(false)} />
                </div>

            </fieldset>
            
        </form>
    </div>
}
export default Edge_Modal