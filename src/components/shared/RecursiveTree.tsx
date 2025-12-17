// Passo 1: trazer a arvore plane
// Passo 2: formatar a arvore plana para arvore recursiva para renderizar o layout recursivo
// Passo 3: não se preucupe com formatar a arvore recursiva para plana pois ela ja veio plana!
// Passo 4: não precisa do flatTree pois os dados ja vão fir flat tree so precisar transformar para recursiva para fins de layout!
// Passo 5: todas operações serão feitas com arvore plana e automaticamente ela será modificada e o metodo de formatação cuidará da arvore recursiva automatico para o layout!

import { useRef, useState } from "react";
import { unflattenTree, type FlatNode, type TreeNode } from "@/types/tree";
import { ChevronDown, ChevronRight, Copy, Download, File, FilePlus, Folder, FolderOpen, FolderPlus, Pencil, PlusCircle, Star, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";

interface FileTreeProps {
    data: FlatNode[];
}

export function RecursiveTree({ data }: FileTreeProps) {
    const dropzone = useRef<HTMLDivElement>(null);

    const [foldersOpen, setFoldersOpen] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null | undefined>(undefined);

    const folderOpen = (id: string): void => setFoldersOpen(prev => prev.includes(id) ? prev.filter(id => id === id) : [...prev, id]);

    function handleSelect(id: string, e: React.MouseEvent) {
        const isCtrl = e.ctrlKey || e.metaKey;

        // 🔹 SHIFT + CLICK (intervalo)
        if (e.shiftKey && lastSelectedId) {
            const start = data.findIndex(n => n.id === lastSelectedId);
            const end = data.findIndex(n => n.id === id);

            if (start === -1 || end === -1) return;

            const [from, to] = start < end ? [start, end] : [end, start];
            const range = data.slice(from, to + 1).map(n => n.id);

            setSelectedIds(range);
            return;
        }

        // 🔹 CTRL / CMD + CLICK (toggle)
        if (isCtrl) {
            setSelectedIds(prev => {
                if (prev.includes(id)) {
                    // remove da seleção
                    return prev.filter(item => item !== id);
                } else {
                    // adiciona à seleção
                    return [...prev, id];
                }
            });

            setLastSelectedId(id);
            return;
        }

        // 🔹 CLICK NORMAL
        setSelectedIds([id]);
        setLastSelectedId(id);
    }

    function handleDragEnter(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const toElement = e.relatedTarget as HTMLElement | null;
        if (!dropzone.current?.contains(toElement)) {
            setHoveredNodeId(undefined);
        }
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault();

        const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;

        if (!el) {
            setHoveredNodeId(null);
            return;
        }

        const nodeId = el.dataset.nodeId!;
        const nodeType = el.dataset.nodeType; // "folder" ou "file"
        const parentId = el.dataset.parentId || null;

        if (nodeType === "folder") {
            // abre a pasta se necessário
            folderOpen(nodeId);

            // só atualiza hoveredNodeId se mudou
            if (hoveredNodeId !== nodeId) {
                setHoveredNodeId(nodeId);
            }
            return;
        }

        // Se for arquivo, só atualiza se o parentId for diferente do hoveredNodeId atual
        if (nodeType === "file" && hoveredNodeId !== parentId) {
            setHoveredNodeId(parentId);
            return;
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        setHoveredNodeId(undefined);

        const files = Array.from(e.dataTransfer.files);
        const text = e.dataTransfer.getData("text/plain");

        if (files.length > 0) { // Fazer upload dos arquivos arrastados com o hoveredNodeId
            console.log("Files dropped in:", hoveredNodeId);
        }

        if (text) { // Fazer o update dos parentIds dos nodes usando hoveredNodeId
            const draggedIds = JSON.parse(text);
            console.log(draggedIds, `dropped in ${hoveredNodeId}`);
        }
    }

    function handleContextMenuCapture(e: React.MouseEvent<HTMLElement>) {
        const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;

        if (!el) {
            console.log("Right click no root");
            return;
        }

        const nodeId = el.dataset.nodeId;
        const nodeType = el.dataset.nodeType;
        const parentId = el.dataset.parentId || null;

        if (nodeId && !selectedIds.includes(nodeId)) {
            handleSelect(nodeId, e);
        }

        console.log(`Right click in: node: ${nodeId}, type: ${nodeType}, parent: ${parentId}`);
    }

    const isDisabled: boolean = selectedIds.length > 1;

    return (
        <ContextMenu>
            <ContextMenuTrigger
                onContextMenuCapture={handleContextMenuCapture}
                className="min-h-0 h-full w-full"
            >
                <ScrollArea
                    id="root"
                    data-node-id={null}
                    ref={dropzone}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`min-h-0 h-full w-full border-l border-transparent ${hoveredNodeId === null && "bg-primary/20 border-primary"}`}
                >
                    <div className="text-sm font-mono">
                        {/* Usar o FlatTree para renderizar um json mais facil de trabalhar */}
                        {unflattenTree(data).map(node => (
                            <TreeNodeComponent
                                key={node.id}
                                node={node}
                                level={1}
                                parentId={null}
                                foldersOpen={foldersOpen}
                                setFoldersOpen={setFoldersOpen}
                                selectedIds={selectedIds}
                                onSelect={handleSelect}
                                hoveredNodeId={hoveredNodeId}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52 text-sm font-mono">
                <ContextMenuItem className='gap-3' disabled={isDisabled}><Folder /> Open</ContextMenuItem>
                <ContextMenuSub>
                    <ContextMenuSubTrigger className='gap-3' disabled={isDisabled}><PlusCircle className='size-4' /> New</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">
                        <ContextMenuItem className='gap-3'><FolderPlus className='size-4' /> Folder</ContextMenuItem>
                        <ContextMenuItem className='gap-3'><FilePlus className='size-4' /> File</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                <ContextMenuSeparator />
                <ContextMenuItem className='gap-3' disabled={isDisabled}><Pencil className='size-4' /> Rename</ContextMenuItem>
                <ContextMenuItem className='gap-3' disabled={false}><Star className='size-4' />Favorite</ContextMenuItem>
                <ContextMenuItem className='gap-3' disabled={isDisabled}><Copy className='size-4' /> Copy URL</ContextMenuItem>
                <ContextMenuItem className='gap-3'><Download className='size-4' />Download</ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem className='gap-3' variant="destructive"><Trash2 /> Delete</ContextMenuItem>
            </ContextMenuContent>
        </ContextMenu>
    );
}

interface TreeNodeProps {
    node: TreeNode;
    level: number;
    parentId: string | null;

    foldersOpen: string[];
    setFoldersOpen: React.Dispatch<React.SetStateAction<string[]>>;

    selectedIds: string[];
    onSelect: (id: string, e: React.MouseEvent) => void;

    hoveredNodeId: string | null | undefined;
}

function TreeNodeComponent({
    node,
    level,
    parentId,
    foldersOpen,
    setFoldersOpen,
    selectedIds,
    onSelect,
    hoveredNodeId,
}: TreeNodeProps) {
    const isFolder = node.type === "folder";
    const isOpen = foldersOpen.includes(node.id);
    const isSelected = selectedIds.includes(node.id);

    const isHovered = hoveredNodeId === node.id;


    function handleDragStart(e: React.DragEvent, node: TreeNode) {
        e.stopPropagation();

        // 1️⃣ Determina os IDs a enviar
        const idsToDrag = selectedIds.includes(node.id) ? selectedIds : [node.id];

        // 2️⃣ Passa pelo DataTransfer como JSON
        e.dataTransfer.setData("text/plain", JSON.stringify([idsToDrag]));

        // 3️⃣ Ghost customizado
        const text = idsToDrag.length > 1 ? `${idsToDrag.length} nodes selected` : "1 node selected";

        const dragGhost = document.createElement("div");
        dragGhost.style.position = "absolute";
        dragGhost.style.top = "-1000px";
        dragGhost.style.left = "-1000px";
        dragGhost.style.padding = "4px 12px";
        dragGhost.style.background = "rgba(0,0,0,0.8)";
        dragGhost.style.color = "white";
        dragGhost.style.borderRadius = "4px";
        dragGhost.style.fontSize = "12px";
        dragGhost.textContent = text;
        document.body.appendChild(dragGhost);

        e.dataTransfer.setDragImage(dragGhost, 0, 0);

        // Remove ghost após o drag
        setTimeout(() => {
            document.body.removeChild(dragGhost);
        }, 0);
    }

    return (
        <div className="select-none" draggable={true} onDragStart={(e) => handleDragStart(e, node)}>
            <div
                data-node-id={node.id}
                data-node-type={node.type}
                data-parent-id={parentId}
                className={`relative flex items-center py-0.5 cursor-pointer select-none 
                    ${isSelected ? "bg-accent/30 text-accent-foreground" : ""}
                    ${isHovered && "bg-primary/20"}
                `}
                style={{ paddingLeft: `${level * 20}px` }}
                onClick={(e) => {
                    onSelect(node.id, e);

                    if (isFolder && !e.shiftKey && !e.ctrlKey) {
                        setFoldersOpen(prev =>
                            prev.includes(node.id)
                                ? prev.filter(id => id !== node.id)
                                : [...prev, node.id]
                        );
                    }
                }}
            >
                <span className={`${isFolder ? "visible" : "invisible"} mr-1`}>
                    {isOpen ? (
                        <ChevronDown className="size-4" />
                    ) : (
                        <ChevronRight className="size-4" />
                    )}
                </span>

                <span className="mr-2">
                    {isFolder ? (
                        isOpen ? (
                            <FolderOpen className="size-4" />
                        ) : (
                            <Folder className="size-4" />
                        )
                    ) : (
                        <File className="size-4" />
                    )}
                </span>

                {node.name} {node.id}
            </div>

            {isFolder && isOpen && node.children && (
                <div className={`relative ${isHovered && "bg-primary/20"}`}>
                    <div className={`absolute top-0 bottom-0 w-px bg-border ${isSelected && 'bg-primary/50'} ${isHovered && "bg-primary"}`} style={{ left: `${level * 20 + 7.4}px` }} />

                    {node.children.map(child => (
                        <TreeNodeComponent
                            key={child.id}
                            node={child}
                            level={level + 1}
                            parentId={node.id}
                            foldersOpen={foldersOpen}
                            setFoldersOpen={setFoldersOpen}
                            selectedIds={selectedIds}
                            onSelect={onSelect}
                            hoveredNodeId={hoveredNodeId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}