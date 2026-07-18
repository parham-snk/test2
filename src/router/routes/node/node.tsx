import { FC, useCallback, useEffect, useState } from "react";
import { useAuth } from "../home/AuthContext";
import supapabase from "../../../supabase";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { Controls, Background, ReactFlow, applyNodeChanges, Panel, Node, useReactFlow, Handle, applyEdgeChanges } from "@xyflow/react"
import "@xyflow/react/dist/style.css";

import { notify } from "../../utilities/utilities";

import { AiOutlineAppstoreAdd, AiOutlineLoading } from "react-icons/ai";
import { IoMdArrowBack, IoMdExit } from "react-icons/io";
import Add_Node_Page_Modal from "./modals/add-node-modal";
import { Toaster } from "react-hot-toast";

import { Edge, Position } from "reactflow";




type nodeType = {
    id: string,
    position: { x: number, y: number },
    type: string,
    data: { label: string },
}




export default function Node_Page() {

    const navigate = useNavigate()
    const { user } = useAuth()!

    if (!user) navigate("/dashboard")


    const { node_id } = useParams<{ node_id: string }>()
    const [isloading, setIsLoading] = useState<boolean>(true)
    const [nodes, setNodes] = useState([])
    const [edges, setEdges] = useState([])


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

    async function get_edges() {
        const { error, data } = await supapabase.schema("articles").from("edges").select("*")
        if (error) return;
        let s = data.map(item => ({ id: item.id, source: String(item.source), target: String(item.target) }))
        setEdges(s as any)

    }
    useEffect(() => {
        get_nodes()
        get_edges()
    }, [])





    const MyNode: FC<{ data: { label: string } }> = ({ data }) => {

        return <div className={"max-w-52 rounded  bg-zinc-900 bg-opacity-30 backdrop-blur-md text-gray-300 text-sm p-2 border border-gray-500 "}>
            <div  dir="auto" className={"whitespace-pre-line"} >{data.label}</div>
            <Handle position={Position.Right} type="target" />
            <Handle position={Position.Left} type="source" />
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
                    onDoubleClick={(eve) => {
                        eve.preventDefault()
                    }}
                    nodes={nodes}
                    edges={edges}
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

                    onConnect={async (connection) => {
                        console.log(connection)
                        let { source, target } = connection
                        let id = `${source}-${target}`
                        const { error } = await supapabase.schema("articles").from("edges").insert({ id, source, target, auther: user?.id })
                        if (error) {
                            return notify("error", "error")

                        }
                        get_edges()


                    }}
                    onEdgeClick={(eve, edge) => console.log(edge)}
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
                                    if (type) {
                                        get_nodes()
                                        setShowNodeModal(false)
                                        setModalData(null)
                                    }
                                }} />
                            }
                        </div>
                    </Panel>
                    <Panel position="top-right">
                        <div className="bg-white text=black p-1 select-none">{node_id}</div>
                    </Panel>
                </ReactFlow>
            }
        </div>
    )
}