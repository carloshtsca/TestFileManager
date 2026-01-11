import { useEffect, useRef } from "react";

import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FlatNode } from "@/types/tree";

import { toast } from "sonner"
import { useTreeStore } from "@/store/treeStore";
import { RenameSchema, type RenameFormValues } from "@/schemas/rename";

interface NodeDialogProps {
    open: boolean;
    onClose: () => void;
    node?: FlatNode;
}

export default function RenameDialog({ open, onClose, node }: NodeDialogProps) {
    if (!node) return null;
    
    const { rename } = useTreeStore();

    const form = useForm<RenameFormValues>({
        resolver: zodResolver(RenameSchema),
        defaultValues: {
            nodeId: node.id,
            name: removeExtension(node.name),
        },
        mode: "onChange",
    });

    useEffect(() => {
        form.reset({
            nodeId: node.id,
            name: removeExtension(node.name),
        });
    }, [node]);

    const onSubmit = async (values: RenameFormValues) => {
        try {
            const response = await rename(values);
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

    function removeExtension(name: string) {
        const lastDot = name.lastIndexOf(".");
        return lastDot === -1 ? name : name.slice(0, lastDot);
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent className="sm:max-w-[465px]">
                <DialogHeader className='mb-4'>
                    <DialogTitle>Rename</DialogTitle>
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

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>

                            <Button type="submit" disabled={!form.formState.isValid} className='cursor-pointer'>
                                {form.formState.isSubmitting ? <Spinner /> : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};