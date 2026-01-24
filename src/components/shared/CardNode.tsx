import { useNavigate } from "react-router-dom";

import { GoFileDirectoryFill } from "react-icons/go";
import { FaFile } from "react-icons/fa";

import type { FlatNode } from "@/types/tree";

interface CardNodeProps {
    node: FlatNode;
    hoveredNodeId: string | null;
    setDraggedIds: (ids: string[]) => void;
}

export default function CardNode({ node, hoveredNodeId, setDraggedIds }: CardNodeProps) {
    const navigate = useNavigate();

    function doubleClick() {
        if (node.type === "folder") {
            navigate(`/my_files/${node.id}`);
        } else {
            // file
            alert(`file: ${node.name}`);
        }
    };

    return (
        <div
            data-node-id={node.id}
            data-parent-id={node.parentId}
            data-node-type={node.type}
            onDoubleClick={doubleClick}
            className={`relative bg-accents w-full flex flex-col items-center justify-between gap-2 py-5 rounded-md border-2 border-transparent 
            hover:border-primaryssss hover:bg-accent font-mono select-none ${hoveredNodeId === node.id && "bg-primary/20"}`}
        >
            {node.type === 'folder' ? <GoFileDirectoryFill className="text-[32px] text-[#F2C94C]" /> : <FaFile className='text-[32px] text-purple-300' />}
            <span className="text-[12px] text-center">{node.name}</span>
        </div>
    );
};
