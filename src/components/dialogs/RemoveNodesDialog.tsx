import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog"
import { Spinner } from "@/components/ui/spinner";
import { useTreeStore } from "@/store/treeStore";

import { toast } from "sonner";
import { Button } from "../ui/button";


interface RemoveNodesAlertDialogProps {
    open: boolean;
    onClose: () => void;
    ids: string[];
};

export default function RemoveNodesAlertDialog({ open, onClose, ids }: RemoveNodesAlertDialogProps) {
    const { trash, remove, status } = useTreeStore();

    const removeIds = async () => {
        try {
            const response = await remove(ids);
            if (response.data.deleted) {
                toast.success(response.message);
                onClose();
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={(value) => !value && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader className='mb-5'>
                    <AlertDialogTitle>Delete {ids?.length!} item{ids?.length! > 1 ? "s" : ""}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete Node?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button variant="destructive" onClick={removeIds} disabled={status.delete.loading}>{status.delete.loading ? <Spinner /> : "Remove"}</Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
