import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MoreVertical, Search } from "lucide-react";

import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, } from "@/components/ui/input-group"
import { Progress } from "@/components/ui/progress";
import { RecursiveTree } from "@/components/shared/RecursiveTree";
import ContentNode from "@/components/shared/ContentNode";

import { useTreeStore } from "@/store/treeStore";
import { useAuthStore } from "@/store/authStore";

import { formatBytes } from "@/utils/formatBytes";
import { toast } from "sonner";

export default function MyFilesScreen() {
    const navigate = useNavigate();

    const { id } = useParams<{ id?: string }>();
    const currentId: string | null = id ?? null;

    const { flatTree, getActiveNodes, getDeletedNodes, getClosestActiveNodeId } = useTreeStore();
    const { user } = useAuthStore();

    const node = currentId === null ? null : getActiveNodes().find(n => n.id === currentId) ?? null;
    const children = getActiveNodes().filter(n => n.parentId === currentId);

    useEffect(() => {
        if (flatTree.length === 0) return;

        const resolvedId = getClosestActiveNodeId(currentId);

        if (!currentId) return;

        if (resolvedId !== currentId) {
            navigate(
                resolvedId ? `/my_files/${resolvedId}` : `/my_files`,
                { replace: true }
            );
        }
    }, [currentId, flatTree]);

    return (
        <ResizablePanelGroup direction="horizontal" className="w-full">
            <ResizablePanel defaultSize={25}>
                <div className="dark:bg-[#111111] bg-[#EDEDED] h-full w-full sm:min-w-90 flex flex-col py-3">
                    {/* TOP */}
                    <div className='flex flex-col gap-5 px-4 pb-5'>
                        <div className='flex flex-col items-center gap-4'>
                            <div className="w-full flex items-center justify-between">
                                <span className='text-md font-semibold'>File Manager</span>

                                <div className='flex items-center gap-1'>
                                    <Button size='icon' variant='ghost'><MoreVertical className='size-5' /></Button>
                                </div>
                            </div>

                            <InputGroup className="[--radius:9999px] bg-transparent!">
                                <InputGroupInput
                                    placeholder="Search files or folder"
                                    className="bg-transparent! !focus:bg-transparent"
                                />
                                <InputGroupAddon align="inline-end" className="bg-transparent!">
                                    <Search />
                                </InputGroupAddon>
                            </InputGroup>
                        </div>
                    </div>

                    {/* MAIN */}
                    <RecursiveTree data={getActiveNodes()} />

                    {/* FOOTER */}
                    <div className='flex flex-col gap-2 px-4 pt-4'>
                        <span className='text-md font-semibold'>Storage</span>
                        <Progress value={15} className='h-1' />
                        <span className='text-[#808080] text-sm'>
                            {flatTree.filter(n => n.type === "file").length} files |{" "}
                            {user && formatBytes(user.storageUsed)} /{" "}
                            {user && formatBytes(user.storageLimit)}
                        </span>
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={75}>
                <ContentNode node={node} children={children} />
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};