import { ResizableHandle, ResizablePanel, ResizablePanelGroup, } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { MoreVertical, Search } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupInput, } from "@/components/ui/input-group"
import { Progress } from "../ui/progress";

import { flatTreeData, treeData } from "@/types/tree";
import { LayoutTree } from "../shared/LayoutTree";
import { RecursiveTree } from "../shared/RecursiveTree";

export default function MyFilesScreen() {
    return (
        <ResizablePanelGroup
            direction="horizontal"
            className="w-full"
        >
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
                    {/* <LayoutTree data={treeData} /> */}
                    <RecursiveTree data={flatTreeData} />

                    {/* FOOTER */}
                    <div className='flex flex-col gap-2 px-4 pt-4'>
                        <span className='text-md font-semibold'>Storage</span>
                        <Progress value={12} className='h-1' />
                        <span className='text-[#808080] text-sm'>12 files | 110.97GB / 116.3GB</span>
                    </div>
                </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={75}>
                <div className="flex h-full items-center justify-center p-0">
                    <span className="font-semibold">Content</span>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    );
};
