import { useEffect, useRef, useState } from "react";
import type { TreeNode } from "@/types/tree";
import { ChevronDown, ChevronRight, File, Folder, FolderOpen } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";

interface TreeNodeProps {
    node: TreeNode;
    level?: number;
    parentId?: string | null;
    dragId?: string | null | undefined;
    setDragId?: (id: string | null | undefined) => void;

    selectedIds: string[];
    setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
};

interface FileTreeProps {
    data: TreeNode[];
};

export function FileTree({ data }: FileTreeProps) {
    const dropzone = useRef<HTMLDivElement>(null);

    const [dragZone, setDragZone] = useState<boolean>(false);
    const [dragId, setDragId] = useState<string | null | undefined>(undefined);

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        const dz = dropzone.current;
        if (!dz) return;

        const handleDragEnter = (ev: DragEvent) => {
            ev.preventDefault();
            setDragZone(true);
        };

        const handleDragOver = (ev: DragEvent) => {
            ev.preventDefault();
            setDragId(null);
        };

        const handleDragLeave = (ev: DragEvent) => {
            if (!dz.contains(ev.relatedTarget as Node)) {
                setDragZone(false);
                setDragId?.(undefined);
            }
        };

        const handleDrop = (ev: DragEvent) => {
            ev.preventDefault();
            setDragZone(false);
            setDragId?.(undefined);

            const dropTargetId = (ev.currentTarget as HTMLElement).id;

            // Caso sejam arquivos arrastados do sistema
            if (ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) {
                console.log(`UPLOAD -> ParentId: root - Files: ${ev.dataTransfer.files.length}, dropping in: ${dropTargetId}`);
                return;
            };
        };

        dz.addEventListener("dragenter", handleDragEnter);
        dz.addEventListener("dragover", handleDragOver);
        dz.addEventListener("dragleave", handleDragLeave);
        dz.addEventListener("drop", handleDrop);
        window.addEventListener("dragleave", () => {
            setDragId(undefined);
        });

        return () => {
            dz.removeEventListener("dragenter", handleDragEnter);
            dz.removeEventListener("dragover", handleDragOver);
            dz.removeEventListener("dragleave", handleDragLeave);
            dz.removeEventListener("drop", handleDrop);
            window.removeEventListener("dragleave", () => {
                setDragId(undefined);
            });
        };
    }, []);

    useEffect(() => {
        if (dragId === null) {
            setDragZone(true);
        } else {
            setDragZone(false);
        }
    }, [dragId]);

    useEffect(() => {
        console.log(selectedIds);
    }, [selectedIds]);

    return (
        <ScrollArea id="root" ref={dropzone} className={`min-h-0 h-full w-full ${dragZone && 'bg-primary/30'}`}>
            <div className="text-sm font-mono">
                {data.map((node, i) => (
                    <TreeNode key={i} node={node} level={1} parentId={null} dragId={dragId} setDragId={setDragId} setSelectedIds={setSelectedIds} selectedIds={selectedIds} />
                ))}
            </div>
        </ScrollArea>
    );
};

export function TreeNode({ node, level = 0, parentId, dragId, setDragId, setSelectedIds, selectedIds }: TreeNodeProps) {
    const dropzone = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [dragZone, setDragZone] = useState<boolean>(false);

    const isFolder = node.type === "folder";
    const id = isFolder ? node.id : parentId;

    useEffect(() => {
        const dz = dropzone.current;
        if (!dz) return;

        const handleDragEnter = (ev: DragEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            setDragZone(true);
            setOpen(true);
            setDragId?.(id);

            console.log(`parentId: ${parentId} - dragId: ${dragId} - nodeId: ${node.id} - type: ${node.type}`);
        };

        const handleDragOver = (ev: DragEvent) => {
            ev.preventDefault();
            ev.stopPropagation();
            setDragId?.(id);
        };

        const handleDragLeave = (ev: DragEvent) => {
            if (!dz.contains(ev.relatedTarget as Node)) {
                setDragZone(false);
            }
            ev.stopPropagation();
        };

        const handleDrop = (ev: DragEvent) => {
            ev.preventDefault();
            ev.stopPropagation();

            setDragZone(false);
            setDragId?.(undefined);

            // Caso sejam arquivos arrastados do sistema
            if (ev.dataTransfer?.files && ev.dataTransfer.files.length > 0) {
                // console.log(`Folder Parent: ${parentId} - ${node.type}: ${node.id} -> Files: ${ev.dataTransfer.files.length}`);
                console.log(`UPLOAD -> ParentId: ${id}, DragId: ${dragId}, nodeId: ${node.id}, files: ${ev.dataTransfer.files.length}`);
                return;
            };
        };

        dz.addEventListener("dragenter", handleDragEnter);
        dz.addEventListener("dragover", handleDragOver);
        dz.addEventListener("dragleave", handleDragLeave);
        dz.addEventListener("drop", handleDrop);
        window.addEventListener("dragleave", () => {
            setDragId?.(undefined);
        });

        return () => {
            dz.removeEventListener("dragenter", handleDragEnter);
            dz.removeEventListener("dragover", handleDragOver);
            dz.removeEventListener("dragleave", handleDragLeave);
            dz.removeEventListener("drop", handleDrop);
            window.removeEventListener("dragleave", () => {
                setDragId?.(undefined);
            });
        };
    }, []);

    return (
        <div ref={dropzone} id={node.id} className={`select-none`}>
            <div
                id={node.id}
                className={`relative flex items-center py-0.5 cursor-pointer select-none border border-transparent active:bg-primary/30 active:border-primary
                    ${dragId === node.id && "bg-primary/20"}
                    ${selectedIds.includes(node.id) ? "bg-primary/30" : "hover:bg-accent/50"}
                `}
                style={{ paddingLeft: `${level * 20}px` }}
                onClick={() => isFolder && setOpen(!open)}
            >
                <span className={`${isFolder ? 'visible' : 'invisible'} mr-1`}>{open ? <ChevronDown className='size-4' /> : <ChevronRight className='size-4' />}</span>

                <span className="mr-2">{isFolder ? (open ? <FolderOpen className='size-4' /> : <Folder className='size-4' />) : <File className='size-4' />}</span>

                {node.name} {node.id}
            </div>

            {isFolder && open && (
                <div id={node.id} className={`relative ${dragId === node.id && "bg-primary/20"}`}>
                    <div className={`absolute top-0 bottom-0 w-px bg-border ${dragId === node.id && "bg-primary"}`} style={{ left: `${level * 20 + 7.5}px` }} />

                    {node.children?.map((child, i) => (
                        <TreeNode key={i} node={child} level={level + 1} parentId={node.id} dragId={dragId} setDragId={setDragId} setSelectedIds={setSelectedIds} selectedIds={selectedIds} />
                    ))}
                </div>
            )}
        </div>
    );
};