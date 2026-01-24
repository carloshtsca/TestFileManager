// Passo 1: trazer a arvore plane
// Passo 2: formatar a arvore plana para arvore recursiva para renderizar o layout recursivo
// Passo 3: não se preucupe com formatar a arvore recursiva para plana pois ela ja veio plana!
// Passo 4: não precisa do flatTree pois os dados ja vão fir flat tree so precisar transformar para recursiva para fins de layout!
// Passo 5: todas operações serão feitas com arvore plana e automaticamente ela será modificada e o metodo de formatação cuidará da arvore recursiva automatico para o layout!

import { useContext, useRef, useState } from "react";
import { cannotDrop, unflattenTree, type FlatNode, type TreeNode } from "@/types/tree";
import { Check, ChevronDown, ChevronRight, CircleCheckBig, Copy, Download, File, Folder, FolderOpen, Heart, Pencil, PlusCircle, Trash2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from "@/components/ui/context-menu";
import { DialogContext } from "@/context/DIalogProvider";
import { Spinner } from "../ui/spinner";
import { useTreeStore } from "@/store/treeStore";

import { toast } from "sonner";

interface FileTreeProps {
    data: FlatNode[];
}

export function RecursiveTree({ data }: FileTreeProps) {
    const { open } = useContext(DialogContext);
    const { upload, updateParent, favorite, restore, setDraggedIds, draggedIds } = useTreeStore();

    const dropzone = useRef<HTMLDivElement>(null);

    const [foldersOpen, setFoldersOpen] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const [contextNode, setContextNode] = useState<FlatNode | null>(null);
    const [selectedNode, setSelectedNode] = useState<FlatNode | null>(null);

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null | undefined>(undefined);

    const [copied, setCopied] = useState(false);

    const folderOpen = (id: string): void => setFoldersOpen(prev => prev.includes(id) ? prev.filter(id => id === id) : [...prev, id]);

    function flattenVisibleTree(
        nodes: TreeNode[],
        foldersOpen: string[],
        result: string[] = []
    ): string[] {
        for (const node of nodes) {
            result.push(node.id);

            if (node.type === "folder" && foldersOpen.includes(node.id) && node.children) {
                flattenVisibleTree(node.children, foldersOpen, result);
            }
        }
        return result;
    }

    function handleSelect(id: string, e: React.MouseEvent) {
        const isCtrl = e.ctrlKey || e.metaKey;

        // 🔹 SHIFT + CLICK (intervalo)
        if (e.shiftKey && lastSelectedId) {
            // Substituir data.findIndex por flattenVisibleTree
            const visibleIds = flattenVisibleTree(unflattenTree(data), foldersOpen);

            const start = visibleIds.indexOf(lastSelectedId);
            const end = visibleIds.indexOf(id);

            if (start === -1 || end === -1) return;

            const [from, to] = start < end ? [start, end] : [end, start];
            const range = visibleIds.slice(from, to + 1);

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

        // Decide qual ID usar para hover: folder -> nodeId, file -> parentId
        const targetId = nodeType === "folder" ? nodeId : parentId;

        // Se não pode dropar aqui, não marca como hovered
        if (cannotDrop(data, draggedIds, targetId)) {
            setHoveredNodeId(undefined); // ou null, dependendo do seu caso
            return;
        }

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

    async function handleDrop(e: React.DragEvent) {
        e.preventDefault();

        if (hoveredNodeId === undefined) return;

        setIsDragging(false);
        setHoveredNodeId(undefined);

        const files = Array.from(e.dataTransfer.files);
        const text = e.dataTransfer.getData("text/plain");

        if (files.length > 0) { // Fazer upload dos arquivos arrastados com o hoveredNodeId
            console.log("Files dropped in:", hoveredNodeId);
            try {
                const response = await upload({ parentId: hoveredNodeId!, files });
                toast.success(response.message);
            } catch (err: any) {
                toast.error(err.message);
            }
        }

        if (text) { // Fazer o update dos parentIds dos nodes usando hoveredNodeId
            const draggedIds = JSON.parse(text);
            console.log(draggedIds, `dropped in ${hoveredNodeId}`);

            try {
                const response = await updateParent({ parentId: hoveredNodeId!, nodesIds: draggedIds });
                toast.success(response.message);
            } catch (err: any) {
                toast.error(err.message);
            }
        }

        setDraggedIds([]);
    }

    function handleContextMenuCapture(e: React.MouseEvent<HTMLElement>) {
        const el = (e.target as HTMLElement).closest("[data-node-id]") as HTMLElement | null;

        if (!el) {
            console.log("Right click no root");
            setContextNode(null);
            setSelectedIds([]);
            return;
        }

        const nodeId = el.dataset.nodeId;

        if (nodeId && !selectedIds.includes(nodeId)) {
            handleSelect(nodeId, e);
        }

        const node = data.find(item => item.id === nodeId);

        setContextNode(node!);

        if (node?.type === "file") {
            // adiciona o no parent que é uma pasta
            setSelectedNode(data.find(item => item.id === node.parentId)!);
        } else {
            // adiciona o no da pasta
            setSelectedNode(node!);
            if (!foldersOpen.includes(node!.id)) setFoldersOpen([...foldersOpen, node!.id]);
        }

        console.log(`Right click in: node: `, node);
    }

    const isDisabled: boolean = selectedIds.length > 1 || selectedIds.length === 0;

    const favoriteNode = async () => {
        try {
            const response = await favorite(selectedIds);
            toast.success(response.message);
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <ContextMenu>
            <ContextMenuTrigger
                onContextMenuCapture={handleContextMenuCapture}
                className="min-h-0 h-full w-full"
            >
                <ScrollArea
                    id="root"
                    data-node-id={null} // Tenho que repetir isso no outro layout da lateral
                    ref={dropzone}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`min-h-0 h-full w-full border-l border-transparent ${hoveredNodeId === null && "bg-primary/20 border-primary"}`}
                >
                    <div className="text-sm font-mono h-full flex flex-col">
                        {false ? (
                            <div className="flex flex-1 items-center justify-center">
                                <Spinner className="h-5 w-5 text-muted-foreground" />
                            </div>
                        ) : (!data || unflattenTree(data).length === 0) ? (
                            <div className="flex flex-1 items-center justify-center py-5 text-muted-foreground">
                                Nenhum item para exibir
                            </div>
                        ) : (
                            unflattenTree(data).map(node => (
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
                                    setDraggedIds={setDraggedIds}
                                />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-52 text-sm font-mono">
                {!isDisabled && <ContextMenuItem className='gap-3' disabled={isDisabled}><Folder /> Open</ContextMenuItem>}
                <ContextMenuSub>
                    <ContextMenuSubTrigger className='gap-3'><PlusCircle className='size-4' /> New</ContextMenuSubTrigger>
                    <ContextMenuSubContent className="w-44">
                        <ContextMenuItem className='gap-3' onClick={() => {
                            open("add-folder", { parentNode: selectedNode })
                            setSelectedNode(null);
                        }}><Folder className='size-4' /> Folder</ContextMenuItem>
                        <ContextMenuItem className='gap-3'><File className='size-4' /> File</ContextMenuItem>
                    </ContextMenuSubContent>
                </ContextMenuSub>
                {selectedIds.length !== 0 && <ContextMenuSeparator />}
                {!isDisabled &&
                    <ContextMenuItem className='gap-3' disabled={isDisabled}
                        onClick={() => {
                            if (contextNode) open("rename", { node: contextNode })
                            setSelectedNode(null);
                        }}
                    ><Pencil className='size-4' /> Rename</ContextMenuItem>
                }
                {contextNode?.type === "file" &&
                    <ContextMenuItem
                        className='gap-3'
                        onSelect={async (e) => {
                            e.preventDefault(); // 👈 impede fechar o menu

                            if (!contextNode?.url) return;

                            try {
                                await navigator.clipboard.writeText(contextNode.url);
                                setCopied(true);
                                setTimeout(() => setCopied(false), 1500);
                                toast.info("Copy url successfully!");
                            } catch {
                                toast.error("Erro ao copiar a URL");
                            }
                        }}
                    >
                        {copied ? <Check className='size-4' /> : <Copy className='size-4' />} Copy URL
                    </ContextMenuItem>
                }
                {selectedIds.length !== 0 &&
                    <ContextMenuItem className='gap-3' disabled={false} onClick={favoriteNode}>
                        {contextNode?.isFavorite ? <CircleCheckBig className='size-4' /> : <Heart className='size-4' />} Favorite
                    </ContextMenuItem>
                }
                {selectedIds.length !== 0 && <ContextMenuItem className='gap-3'><Download className='size-4' />Download</ContextMenuItem>}
                {selectedIds.length !== 0 &&
                    <>
                        <ContextMenuSeparator />
                        <ContextMenuItem className='gap-3' variant="destructive"
                            onClick={() => {
                                open("remove-nodes", { ids: selectedIds });
                                setSelectedNode(null);
                                setSelectedIds([]);
                            }}
                            disabled={selectedIds.length === 0}
                        ><Trash2 /> Delete</ContextMenuItem>
                    </>
                }
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

    setDraggedIds: (ids: string[]) => void;
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
    setDraggedIds
}: TreeNodeProps) {
    const isFolder = node.type === "folder";
    const isOpen = foldersOpen.includes(node.id);
    const isSelected = selectedIds.includes(node.id);

    const isHovered = hoveredNodeId === node.id;


    function handleDragStart(e: React.DragEvent, node: TreeNode) {
        e.stopPropagation();

        // 1️⃣ Determina os IDs a enviar
        const idsToDrag = selectedIds.includes(node.id) ? selectedIds : [node.id];
        setDraggedIds(idsToDrag);

        // 2️⃣ Passa pelo DataTransfer como JSON
        e.dataTransfer.setData("text/plain", JSON.stringify(idsToDrag));

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

    function handleDragEnd() {
        setDraggedIds([]);
    };

    return (
        <div className="select-none" draggable={true} onDragStart={(e) => handleDragStart(e, node)} onDragEnd={handleDragEnd}>
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

                {node.name}

                {node.isFavorite && <Heart className="size-4 ml-auto mr-5 flex items-end-safe" color="red" />}
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
                            setDraggedIds={setDraggedIds}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}