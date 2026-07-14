import { FC, useCallback, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Controls, Background, ReactFlow, applyNodeChanges, Panel, Node, useReactFlow } from "@xyflow/react"
import "@xyflow/react/dist/style.css";
import supapabase from "../../../supabase";
import { notify } from "../../utilities/utilities";

import { AiOutlineAppstoreAdd, AiOutlineLoading } from "react-icons/ai";
import { IoMdArrowBack, IoMdExit } from "react-icons/io";
import Add_Node_Page_Modal from "./modals/add-node-modal";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../home/AuthContext";




type nodeType = {
    id: string,
    position: { x: number, y: number },
    type: string,
    data: { label: string },
}




export default function Node_Page() {

    const navigate = useNavigate()
    const {user}=useAuth()!

    if(!user) navigate("/dashboard")

        
    const { node_id } = useParams<{ node_id: string }>()
    const [isloading, setIsLoading] = useState<boolean>(true)
    const [nodes, setNodes] = useState([])

    const [modalData, setModalData] = useState<Node | null>(null)
    const [showNodeModal, setShowNodeModal] = useState<boolean>(false)


    const onNodesChange = useCallback(
        async (changes: any) => {

            setNodes((nodesSnapshot) => {
                return applyNodeChanges(changes, nodesSnapshot)
            })

        },
        [],
    );



    async function get_nodes() {


        const { data, error } = await supapabase.schema("articles").from("nodes").select("*").eq("parrent_id", node_id)

        setIsLoading(false)
        if (error) return notify("fetch list failed!", "error");

        data as []
        let rows = data.map(item => {
            return {
                id: String(item.id), data: { label: item.text }, position: { x: item.posx, y: item.posy }, drageable: true, type: "custom"
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
        let direction = /\a-zA-z/.test(data.label[0])
        return <div className={"max-w-52 rounded  bg-zinc-900 bg-opacity-30 backdrop-blur-md text-gray-300 text-sm p-2 border border-gray-500 "}>
            <p dir={direction ? "ltr" : "rtl"} className={direction ? "text-left whitespace-pre-line" : "text-right whitespace-pre-line"}>{data.label}</p>
        </div>

    }
    return (
        <div className="bg-zinc-900 w-screen h-screen">
            <title>{node_id}</title>
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
                    onNodesChange={async (changes) => {
                        setNodes((nds) => applyNodeChanges(changes, nds as any) as any);

                    }}
                    onNodeClick={(eve, node) => {
                        setShowNodeModal(false)
                        setTimeout(() => {
                            setModalData(node)
                            setShowNodeModal(true)
                        }, 1);
                    }}
                    onNodeDragStop={async (eve, node: nodeType) => {
                        const { error } = await supapabase.schema("articles").from("nodes").update({ id: node.id, text: node.data.label, posx: node.position.x, posy: node.position.y, parrent_id: node_id }).eq("id", node.id)
                        if (!error) return (

                            notify("node updated", "success")
                        )
                        notify("error", "error")
                    }}
                    nodeTypes={{ custom: MyNode }}
                    fitView
                >
                    <Background />
                    <Controls />
                    <Panel position="top-center">
                        <Toaster />
                    </Panel>
                    <Panel position="top-left">
                        <div className="fixed p-auto left-3 top-4 bg-white text-black   z-50 flex flex-col justify-center align-baseline p-1 gap-2">
                            <div className="cursor-pointer transition-all relative" onClick={async () => {
                                navigate(-1)
                            }}>
                                <div className=" hover:scale-110 ">
                                    <IoMdArrowBack size={20} />
                                </div>
                            </div>
                            {
                                //add-node
                            }
                            <div className="cursor-pointer" onClick={() => {
                                setShowNodeModal(!showNodeModal)
                                setModalData(null)
                            }}>
                                <AiOutlineAppstoreAdd size={20} />
                            </div>
                            {
                                showNodeModal &&
                                <Add_Node_Page_Modal setShowModal={(state) => {
                                    if (!state) {
                                        setShowNodeModal(state)

                                    }
                                }} data={modalData} notify={(msg, type) => { 
                                    notify(msg, type) 
                                    if(type){
                                        get_nodes()
                                        setShowNodeModal(false)
                                        setModalData(null)
                                    }
                                }} />
                            }
                        </div>
                    </Panel>
                </ReactFlow>
            }
        </div>
    )
}