import { useState, useCallback, useContext, useEffect, useRef } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    applyEdgeChanges, applyNodeChanges,
    Connection,
    addEdge,
    Panel
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { data, Link, useNavigate } from "react-router-dom";
import { Edge, MiniMap, Node } from "reactflow";
import { useAuth } from "./AuthContext";

import { AiOutlineAppstoreAdd, AiOutlineLoading } from "react-icons/ai";
import { IoMdExit } from "react-icons/io";
import supapabase from "../../../supabase";
import toast, { Toaster } from "react-hot-toast";
import ADD_NODE_MODAL from "./modals/add-node-modal";
import Edge_Modal from "./modals/edge-modal";



type nodeType = {
    id: string,
    position: { x: number, y: number },
    data: { label: string },
    type: "input" | "output"
}

type EdgeModal = {
    edge: Edge,
    position: {
        clientX: number,
        clientY: number
    }

}



const INIT_nodes = [
    {
        id: "nodejs",
        position: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        data: { label: "nodejs" },
        type: "input"
    }, {
        id: "react",
        position: { x: (window.innerWidth / 2) - 300, y: (window.innerHeight / 2) },
        data: { label: "react" },
        type: "output"
    }

];

const INIT_edges: Edge[] = [
    {
        id: "nodejs-react", source: "nodejs", target: "react", animated: true, type: 'smoothstep',
        label: 'connects with',
    }
];


const notify = (msg: string, icon: "error" | "success") => {
    let ico;
    switch (icon) {
        case "error":
            ico = "❌"
            break;
        case "success":
            ico = "✅"
            break;
    }
    toast(msg, {
        style: { background: "rgba(0,0,0,.5)", backdropFilter: "blur(5px)", color: "white", border: "1px solid white", flexDirection: "row-reverse" },
        icon: ico
    });
}


export default function Home() {

    let { user, session } = useAuth()!
    const navigate = useNavigate()

    if (!session) navigate("/dashboard")

    const [showModal, setShowModal] = useState<boolean>(false)
    const [modalData, setModalData] = useState<nodeType | null>(null)

    const [edgeModal, setEdgeModalShow] = useState<boolean>(false)
    const [edgeModalData, setEdegeModalData] = useState<EdgeModal | null>(null)

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState<Edge[]>([]);


    const [isloading, setIsLoading] = useState<boolean>(true)

    const onNodesChange = useCallback(
        async (changes: any) => {
            setNodes((nodesSnapshot) => {
                return applyNodeChanges(changes, nodesSnapshot)
            })
        },
        [],
    );
    const onEdgesChange = useCallback(
        (changes: any) => {
            console.log(changes)
            setEdges((edgesSnapshot) => applyEdgeChanges(changes as any, edgesSnapshot))
        },
        [],
    );



    async function getNodes() {
        const { data, error } = await supapabase.from("nodes").select("*")

        if (error) return;
        let rows: nodeType[] = []
        data as []
        data.forEach(item => {
            let obj = { id: item.id, data: { label: item.label }, position: { x: item.posx, y: item.posy }, type: item.type, drageable: true }
            rows.push(obj)
        })
        setNodes(rows as any)

        setIsLoading(false)
    }
    async function getEdges() {
        const { data, error } = await supapabase.from("edges").select("*")
        if (error) return notify("خطا در دریافت کانکشن ها!", "error")
        setEdges(data)
    }



    useEffect(() => {
        getNodes()
        getEdges()
    }, [])

    useEffect(() => {
        !showModal && setModalData(null)
    }, [showModal])
    return (
        <div style={{ width: "100vw", height: "100vh" }} className="bg-zinc-800">
            {
                //loading
                isloading && (
                    <div className="w-full h-full absolute bg-zinc-900 bg-opacity-80 backdrop-blur-sm z-50 text-white flex justify-center align-middle items-center">
                        <AiOutlineLoading className="animate-spin" size={60} />
                    </div>
                )
            }
            <Toaster />

            {
                showModal &&
                <ADD_NODE_MODAL notify={(msg, type: "success" | "error") => {
                    if (type != "error") {
                        setShowModal(false)
                        setModalData(null)
                        getNodes()
                    }
                    notify(msg, type)
                }}
                    data={modalData}
                />
            }
            <ReactFlow
                nodes={nodes}

                edges={edges}
                onNodesChange={onNodesChange}
                // onEdgesChange={(changes) => {
                //     console.log(changes)
                // }}
                onNodeClick={(eve, node: nodeType) => {
                    setShowModal(false)
                    setTimeout(() => {
                        setShowModal(true)

                        setModalData(node)
                    }, 10);


                }}
                onNodeDoubleClick={(eve, node) => {


                    setTimeout(() => {
                        setShowModal(false)
                    }, 100);
                    navigate(`/node/${node.id}`)

                }}



                onNodeDragStop={async (eve, node: nodeType) => {
                    const roundNum = (num: number) => Number(num).toFixed(0)
                    let obj = { id: node.id, posx: roundNum(node.position.x), posy: roundNum(node.position.y), type: node.type, label: node.data.label }
                    const { error } = await supapabase.from("nodes").update({ ...obj }).eq("id", node.id)
                    if (error) return notify("error", "error");
                    notify('node changed!', "success")

                }}
                onConnect={async (connection: Connection) => {
                    let obj = { id: `${connection.source}-${connection.target}`.toString(), source: connection.source, target: connection.target }
                    setEdges((eds) => addEdge(connection, eds));
                    const { error } = await supapabase.from("edges").insert(obj)
                    if (error) return notify("خطا در ثبت کانکشن", "error")
                    notify("کانکشن ایجاد شد!", "success")

                }}

                onEdgeClick={(eve, edge) => {
                    const { clientX, clientY } = eve
                    setEdegeModalData({ edge, position: { clientX, clientY } })
                    setEdgeModalShow(true)

                }}
                fitView
            >
                <Panel position="top-left">
                    <div className="fixed p-auto left-3 top-4 bg-white text-black   z-50 flex flex-col justify-center align-baseline p-1 gap-2">
                        <div className="cursor-pointer transition-all relative" onClick={async () => {
                            const { error } = await supapabase.auth.signOut()
                            if (error) return notify("logout failed!", "error")
                            navigate("/dashboard")
                        }}>
                            <div className="rotate-180 hover:scale-110 ">
                                <IoMdExit size={20} />
                            </div>
                        </div>
                        {
                            //add-node
                        }
                        <div className="cursor-pointer" onClick={() => {
                            setShowModal(!showModal)
                        }}>
                            <AiOutlineAppstoreAdd size={20} />
                        </div>

                    </div>
                </Panel>
                <Background color="white" bgColor="zinc" />
                <Controls />

            </ReactFlow>

            {
                edgeModal &&
                <Edge_Modal setShowModal={(state) => {
                    setEdgeModalShow(state)
                    setModalData(null)
                }} edge={edgeModalData?.edge!} position={edgeModalData?.position!} notify={(msg, type) => {
                    notify(msg, type)
                    if (type == "success") {
                        getEdges()
                        setEdgeModalShow(false)
                    }
                }} />
            }
        </div>
    );
}