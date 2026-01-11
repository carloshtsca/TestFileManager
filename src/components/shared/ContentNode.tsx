import { useNavigate } from "react-router-dom";

import { ChevronLeft, ChevronRight, Copy, Download, File, Folder, FolderTree, Heart, Info, LayoutGrid, List, MoreHorizontal, MoreVertical, Pencil, SearchIcon, TextAlignJustify, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput, } from "@/components/ui/input-group"

import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import CardNode from "@/components/shared/CardNode";

import { type FlatNode } from "@/types/tree";
import { formatNodes } from "@/types/tree";
import BreadCrumb from "./BreadCrumb";

interface ContentNodeProps {
    node: FlatNode | null;
    children: FlatNode[];
};

export default function ContentNode({ node, children }: ContentNodeProps) {
    const navigate = useNavigate();

    return (
        <div className="w-full h-full flex flex-col gap-3 p-0 [container-type:inline-size]">
            {/* Header */}
            <div className='w-full flex items-center justify-between px-3 py-3 border-b'>
                <div className='flex items-center gap-2'>
                    <Button variant='ghost' size='icon-sm'><FolderTree size={16} /></Button>

                    <div className='flex items-center'>
                        <Button variant='ghost' size='icon-sm' onClick={() => navigate(-1)}><ChevronLeft size={16} /></Button>
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
                    <Button variant='ghost' size='icon-sm'><Trash2 /></Button>
                    <Button variant='ghost' size='icon-sm'><Pencil /></Button>
                    <Button variant='ghost' size='icon-sm'><Heart /></Button>
                    <Button variant='ghost' size='icon-sm'><Download /></Button>
                    <Button variant='ghost' size='icon-sm'><Copy /></Button>
                    <Button variant='ghost' size='icon-sm'><Info /></Button>

                    <div className="h-6 mx-1 flex items-center">
                        <Separator orientation="vertical" />
                    </div>

                    <Button variant='ghost' size='icon-sm'><LayoutGrid /></Button>
                    <Button variant='ghost' size='icon-sm'><List /></Button>
                    <Button variant='ghost' size='icon-sm'><TextAlignJustify /></Button>

                    <div className="h-6 mx-1 flex items-center">
                        <Separator orientation="vertical" />
                    </div>

                    <Button variant='ghost' size='sm'><Folder /> New folder</Button>
                    <Button variant='ghost' size='sm'><File /> New file</Button>
                </div>
            </div>

            {/* Content */}
            <ScrollArea className="w-full h-full px-5">
                <div className="grid grid-cols-1 @[500px]:grid-cols-3 @[700px]:grid-cols-4 @[900px]:grid-cols-6 @[1100px]:grid-cols-8 @[1300px]:grid-cols-10 @[1600px]:grid-cols-12 @[1800px]:grid-cols-14 gap-1">
                    {formatNodes(children).map((node, i) => (
                        <CardNode key={i} node={node} />
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
};
