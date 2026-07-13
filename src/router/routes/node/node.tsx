import { FC, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Controls, Background, ReactFlow, applyNodeChanges ,Panel} from "@xyflow/react"
import "@xyflow/react/dist/style.css";
import supapabase from "../../../supabase";
import { notify } from "../../utilities/utilities";

import { AiOutlineLoading } from "react-icons/ai";



type nodeType = {
    id: string,
    position: { x: number, y: number },
    type: string,
    data: { label: string },
}

export default function Node() {
    
    const { node_id } = useParams<{ node_id: string }>()
    const [isloading, setIsLoading] = useState<boolean>(true)
    const [nodes, setNodes] = useState<[] | null>([])


    async function get_nodes() {
        const { data, error } = await supapabase.schema("articles").from("nodes").select("*").eq("parrent_id",node_id)

        setIsLoading(false)
        if (error) return notify("fetch list failed!", "error");

        data as []
        let rows = data.map(item => {
            return {
                id: String(item.id), data: { label: item.text }, position: { x: 100, y: 100 }, drageable: true
            }
        })
        setNodes(rows as any)

    }
    useEffect(() => {
        get_nodes()

    }, [])

    useEffect(() => {
        console.log(nodes)
    }, [nodes])


    const MyNode: FC<{ data: { label: string } }> = ({ data }) => {
        console.log(data)
        return <div className="max-w-96 min-h-24 bg-white text-black">{
            data.label
        }</div>
    }
    return (
        <div className="bg-zinc-900 w-screen h-screen">
            {
                //loading
                isloading && (
                    <div className="w-full h-full absolute bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-50 text-white flex justify-center align-middle items-center">
                        <AiOutlineLoading className="animate-spin" size={60} />
                    </div>
                )
            }

            {
                nodes &&
                <ReactFlow
                    nodes={nodes}
                    onNodesChange={(changes) => {
                        setNodes((nds) => applyNodeChanges(changes, nds as any) as any);
                    }}
                    fitView
                >
                    <Background />
                    <Controls />
                    <Panel position="top-left">
                        <Link to={"/"}></Link>
                    </Panel>
                </ReactFlow>
            }
        </div>
    )
}