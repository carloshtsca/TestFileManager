import { createContext, useState, type ReactNode } from "react";

import AddFolderDialog from "@/components/dialogs/AddFolderDialog";
import RemoveNodesAlertDialog from "@/components/dialogs/RemoveNodesDialog";
import RenameDialog from "@/components/dialogs/RenameDialog";

type DialogType = "add-folder" | "rename" | "remove-nodes" | null;

type DialogState = {
    type: DialogType;
    props?: any;
};

type DialogContextType = {
    open: (type: DialogType, props?: any) => void;
    close: () => void;
};

export const DialogContext = createContext<DialogContextType>(
    {} as DialogContextType
);

export function DialogProvider({ children }: { children: ReactNode }) {
    const [dialog, setDialog] = useState<DialogState>({
        type: null,
        props: {},
    });

    const open = (type: DialogType, props?: any) => {
        setDialog({ type, props });
    };

    const close = () => {
        setDialog({ type: null, props: {} });
    };

    return (
        <DialogContext.Provider value={{ open, close }}>
            {children}

            <AddFolderDialog
                open={dialog.type === "add-folder"}
                onClose={close}
                {...dialog.props}
            />

            <RenameDialog 
                open={dialog.type === "rename"}
                onClose={close}
                {...dialog.props}
            />

            <RemoveNodesAlertDialog
                open={dialog.type === "remove-nodes"}
                onClose={close}
                {...dialog.props}
            />
        </DialogContext.Provider>
    );
}
