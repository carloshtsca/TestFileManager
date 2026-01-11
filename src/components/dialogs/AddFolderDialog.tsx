import { useEffect, useRef } from "react";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addFolderSchema, type AddFolderFormValues } from "@/schemas/addFolder";
import type { FlatNode } from "@/types/tree";

import { toast } from "sonner"
import { useTreeStore } from "@/store/treeStore";

interface NodeDialogProps {
    open: boolean;
    onClose: () => void;
    parentNode?: FlatNode | null;
}

export default function NodeDialog({ open, onClose, parentNode }: NodeDialogProps) {
    const { addFolder } = useTreeStore();

    const form = useForm<AddFolderFormValues>({
        resolver: zodResolver(addFolderSchema),
        defaultValues: {
            parentId: parentNode?.id ?? parentNode?.parentId ?? null,
            name: "",
        },
        mode: "onChange",
    });

    useEffect(() => {
        form.reset({
            parentId: parentNode?.id ?? null,
            name: "",
        });
    }, [parentNode]);

    const onSubmit = async (values: AddFolderFormValues) => {
        try {
            const response = await addFolder(values);
            toast.success(response.message);
            form.reset();
            onClose();
        } catch (err: any) {
            if (err.message === 'Server unavailable. Check your connection.') {
                toast.warning(err.message);
            } else {
                toast.error(err.message);
            }
        }
    };

    const onError = (errors: typeof form.formState.errors) => {
        const errorMessages = Object.values(errors).map(err => err.message);

        console.log("Erros do formulário:", errorMessages);

        errorMessages.forEach(msg => {
            toast.error(msg);
        });
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-[465px]">
                <DialogHeader className='mb-4'>
                    <DialogTitle>Create New Folder</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-10">

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className='space-y-1'>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Insert a name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* <Accordion type='single' collapsible className='w-full'>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className='justify-start [&>svg]:order-first cursor-pointer'>
                                    <span className='flex items-center gap-4'>
                                        <span>Advanced Options</span>
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className='w-full flex flex-col gap-5 text-muted-foreground'>
                                    <div className='flex flex-col gap-3'>
                                        <Label htmlFor="name">Location</Label>
                                        <Input disabled placeholder="Folder name" defaultValue="my-files/root/folder" />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="color"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Color</FormLabel>

                                                <div className="flex items-center gap-3 h-10 relative">
                                                    <div
                                                        className="h-full w-14 rounded-md border-2 cursor-pointer"
                                                        style={{ backgroundColor: field.value }}
                                                        onClick={() => colorInputRef.current?.click()}
                                                    />

                                                    <input
                                                        ref={colorInputRef}
                                                        type="color"
                                                        value={field.value}
                                                        onChange={(e) => field.onChange(e.target.value)}
                                                        className="absolute left-0 h-full w-14 opacity-0 cursor-pointer"
                                                    />

                                                    <FormControl>
                                                        <Input
                                                            value={field.value}
                                                            onChange={(e) => field.onChange(e.target.value)}
                                                            className="h-full"
                                                        />
                                                    </FormControl>
                                                </div>

                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion> */}

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>

                            <Button type="submit" disabled={!form.formState.isValid} className='cursor-pointer'>
                                {form.formState.isSubmitting ? <Spinner /> : "Create"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};