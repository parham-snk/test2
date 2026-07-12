import { useState, useCallback, useContext, useEffect, useRef } from "react";
import {
    ReactFlow,
    Background,
    Controls,
    applyEdgeChanges, applyNodeChanges,
    Connection,
    addEdge
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { data, Link, useNavigate } from "react-router-dom";
import { Edge, MiniMap, Node } from "reactflow";
import { useAuth } from "./AuthContext";


import { IoMdExit } from "react-icons/io";
import supapabase from "../../../supabase";
import toast, { Toaster } from "react-hot-toast";



type nodeType = {
    id: string,
    position: { x: number, y: number },
    data: { label: string },
    type: "input" | "output"
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

    const [nodes, setNodes] = useState([]);
    const [edges, setEdges] = useState<Edge[]>([]);


    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const onNodesChange = useCallback(
        async (changes: any) => {
            let timer;
            const { id, data, position, type } = changes[0]! as Node
            if (!position) return;

            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            let snapshot: any;

            timerRef.current = setTimeout(async () => {
                setNodes((nodesSnapshot) => {
                    snapshot = nodesSnapshot;
                    return applyNodeChanges(changes, nodesSnapshot)
                })
                const { error } = await supapabase.from("nodes").update({ id, label: data?.label, posx: Math.floor(position.x!).toFixed(0), posy: Math.floor(position.y!).toFixed(0), type }).eq("id", id)

                changes as any
                if (error) {
                    notify("تغییرات nodeدر دیتابیس ثبت نشد!", "error")
                    return setNodes(snapshot as never)
                }

                notify("!تغییرات ثبت شد", "success")
            }, 100);
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

    return (
        <div style={{ width: "100vw", height: "100vh" }} className="bg-zinc-800">
            <Toaster />
            <div className="fixed p-auto left-4 top-4 bg-white bg-opacity-5 backdrop-blur-sm z-50 rounded-xl flex flex-col justify-center align-baseline ">
                <Link to={'/dashboard'}>
                    <IoMdExit />
                </Link>
            </div>

            <ReactFlow
                nodes={nodes}

                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={(changes) => {
                    console.log(changes)
                }}

                onConnect={async (connection: Connection) => {
                    let obj = { id: `${connection.source}-${connection.target}`.toString(), source: connection.source, target: connection.target }
                    console.log(obj)
                    setEdges((eds) => addEdge(connection, eds));
                    const { error } = await supapabase.from("edges").insert(obj)
                    if (error) return notify("خطا در ثبت کانکشن", "error")
                    notify("کانکشن ایجاد شد!", "success")
                    setEdges((edgesSnapshot) => applyEdgeChanges(obj as any, edgesSnapshot))
                }}
            >

                <Background color="white" bgColor="zinc" />
                <Controls />
            </ReactFlow>

        </div>
    );
}