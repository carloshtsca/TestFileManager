import { useNavigate } from "react-router-dom";

import { MdFavorite, MdFavoriteBorder } from "react-icons/md";
import { FcFolder } from "react-icons/fc";
import { FaFile } from "react-icons/fa";

import type { FlatNode } from "@/types/tree";

interface CardNodeProps {
    node: FlatNode;
}

export default function CardNode({ node }: CardNodeProps) {
    const navigate = useNavigate();

    function doubleClick() {
        if (node.type === "folder") {
            navigate(`/my_files/${node.id}`);
        } else {
            // file
        }
    };

    return (
        <div
            data-node-id={node.id}
            onDoubleClick={doubleClick}
            className="relative bg-accents w-full  flex flex-col items-center justify-center gap-2 py-5 rounded-md border-2 border-transparent 
            hover:border-primaryssss hover:bg-accent font-mono select-none"
        >
            {node.isFavorite && <MdFavorite className='absolute top-2 right-2 text-red-500' />}
            {node.type === 'folder' ? <FcFolder className="text-[5rem]" /> : <FaFile className='text-[5rem] text-primary' />}
            <span className="text-[12px] text-center">{node.name}</span>
        </div>
    );
};
