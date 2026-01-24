import { useContext, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { ChevronLeft, ChevronRight, Copy, Download, FolderTree, Heart, Info, LayoutGrid, List, MoreHorizontal, MoreVertical, Pencil, SearchIcon, TextAlignJustify, Trash2 } from "lucide-react";
import { AiFillFileAdd } from "react-icons/ai";
import { RiFolderAddFill } from "react-icons/ri";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, } from "@/components/ui/input-group"
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardNode from "@/components/shared/CardNode";
import BreadCrumb from "./BreadCrumb";

import { cannotDrop, type FlatNode } from "@/types/tree";
import { formatNodes } from "@/types/tree";
import { useTreeStore } from "@/store/treeStore";
import { DialogContext } from "@/context/DIalogProvider";

import { toast } from "sonner";

interface ContentNodeProps {
    nodeId: string | null;
    data: FlatNode[];
};

export default function ContentNode({ nodeId, data }: ContentNodeProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const node = nodeId === null ? null : data.find(n => n.id === nodeId) ?? null;
    const children = data.filter(n => n.parentId === nodeId);

    const { upload, updateParent, setDraggedIds, draggedIds } = useTreeStore();
    const { open } = useContext(DialogContext);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // drag and drop:
    const dropzone = useRef<HTMLDivElement>(null);

    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>("__none__");

    function handleDragEnter(e: React.DragEvent) {
        e.preventDefault();
    };

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();

        const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;

        if (!el) {
            if (hoveredNodeId !== null) {
                setHoveredNodeId(null);
            }
            return;
        }

        const { nodeId, nodeType, parentId } = el.dataset;

        // Verificação para não soltar nodes na mesma pasta ou em si mesmo ou em filhos
        const targetId = nodeType === "folder" ? nodeId : parentId;
        if (cannotDrop(data, draggedIds, nodeId)) {
            setHoveredNodeId("__none__");
            return;
        }

        if (!nodeType) {
            if (hoveredNodeId !== nodeId) {
                setHoveredNodeId(nodeId!);
            }
            return;
        }

        if (nodeType === "folder") {
            if (hoveredNodeId !== nodeId) {
                setHoveredNodeId(nodeId!);
            }
            return;
        }

        if (nodeType === "file" && hoveredNodeId !== parentId) {
            console.log(parentId)
            if (hoveredNodeId !== parentId) {
                setHoveredNodeId(parentId ? parentId : null);
            }
            return;
        }
    };

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        const toElement = e.relatedTarget as HTMLElement | null;
        if (!dropzone.current?.contains(toElement)) {
            setHoveredNodeId("__none__");
        }
    };

    async function handleDrop(e: React.DragEvent) {
        e.preventDefault();

        if (hoveredNodeId === "__none__") return;

        const files = Array.from(e.dataTransfer.files);
        const text = e.dataTransfer.getData("text/plain");

        // Fazer upload dos arquivos arrastados com o hoveredNodeId
        if (files.length > 0) {
            console.log("Files dropped in:", hoveredNodeId);
            try {
                const response = await upload({ parentId: hoveredNodeId!, files });
                toast.success(response.message);
            } catch (err: any) {
                toast.error(err.message);
            }
        }

        // Fazer o update dos parentIds dos nodes usando hoveredNodeId
        if (text) {
            const draggedIds = JSON.parse(text);
            console.log(draggedIds, `dropped in ${hoveredNodeId}`);

            try {
                const response = await updateParent({ parentId: hoveredNodeId!, nodesIds: draggedIds });
                toast.success(response.message);
            } catch (err: any) {
                toast.error(err.message);
            }
        }

        setHoveredNodeId("__none__");
    }

    return (
        <div className="w-full h-full flex flex-col gap-3 p-0 [container-type:inline-size]">
            {/* Header */}
            <div className='w-full flex items-center justify-between px-3 py-3 border-b'>
                <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='icon-sm'><FolderTree size={16} /></Button>

                    <div className='flex items-center'>
                        <Button variant='ghost' size='icon-sm' onClick={() => navigate(-1)} disabled={location.pathname === '/my_files'}><ChevronLeft size={16} /></Button>
                        <Button variant='ghost' size='icon-sm' onClick={() => navigate(1)}><ChevronRight size={16} /></Button>
                    </div>

                    <BreadCrumb id={node?.id} />
                </div>

                <div>
                    <Button variant='ghost' size='icon-sm'><MoreVertical /></Button>
                </div>
            </div>

            {/* Nav menu */}
            <div className='w-full flex items-center justify-between px-5'>
                <div className='w-[30%] flex items-center'>
                    <InputGroup className='bg-transparent! border-none focus-visible:ring-0 focus-visible:ring-offset-0'>
                        <InputGroupInput placeholder="Search..." />
                        <InputGroupAddon>
                            <SearchIcon />
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                <Button variant='ghost' size='icon-sm' className='@[700px]:hidden'><MoreHorizontal /></Button>

                <div className='hidden items-center gap-1 @[700px]:flex'>
                    {/* O metodo de renomear, info e copy vai pegar o ultimo id selecionado no selectedIds */}
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Download /></Button>
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Copy /></Button>
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Pencil /></Button>
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Heart /></Button>
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Info /></Button>
                    <Button variant='ghost' size='icon-sm' disabled={selectedIds.length === 0}><Trash2 /></Button>

                    <div className="h-6 mx-1 flex items-center">
                        <Separator orientation="vertical" />
                    </div>

                    <Button variant='ghost' size='icon-sm'><LayoutGrid /></Button>
                    <Button variant='ghost' size='icon-sm'><List /></Button>
                    <Button variant='ghost' size='icon-sm'><TextAlignJustify /></Button>

                    <div className="h-6 mx-1 flex items-center">
                        <Separator orientation="vertical" />
                    </div>

                    <Button variant='ghost' size='icon' onClick={() => open("add-folder", { parentNode: node })}><RiFolderAddFill /></Button>
                    <Button variant='ghost' size='icon'><AiFillFileAdd /></Button>
                </div>
            </div>

            {/* Content */}
            <ScrollArea
                ref={dropzone}
                data-node-id={nodeId}
                data-parent-id={node?.parentId}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-full px-5 ${hoveredNodeId === nodeId && "bg-primary/20"}`}
            >
                <div className="grid grid-cols-1 @[500px]:grid-cols-3 @[700px]:grid-cols-4 @[900px]:grid-cols-6 @[1100px]:grid-cols-8 @[1300px]:grid-cols-10 @[1600px]:grid-cols-12 @[1800px]:grid-cols-14 gap-1">
                    {formatNodes(children).map((node, i) => (
                        <CardNode key={i} node={node} hoveredNodeId={hoveredNodeId} setDraggedIds={setDraggedIds} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
