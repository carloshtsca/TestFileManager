import api from "../client";

import type { AddFolderFormValues } from "@/schemas/addFolder";
import type { ApiResponse } from "../client";
import type { FlatNode } from "@/types/tree";
import type { RenameFormValues } from "@/schemas/rename";

export interface UploadValues { parentId: string; files: File[]; };
export interface UpdateParentValues { parentId: string; nodesIds: string[] };

export const getFlatTree = async (deleted: boolean = false): Promise<ApiResponse<FlatNode[]>> => {
    return await api.get("/tree/user", {
        params: { deleted },
    });
};

export const addFolder = async (data: AddFolderFormValues): Promise<ApiResponse<FlatNode>> => {
    return await api.post("/tree/add-folder", data);
};

export const upload = async (data: { parentId: string; files: File[]; }): Promise<ApiResponse<FlatNode[]>> => {
    const formData = new FormData();
    formData.append("parentId", data.parentId);
    data.files.forEach((file) => {
        formData.append("files", file);
    });

    return await api.post("/tree/upload", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};

export const rename = async (data: RenameFormValues): Promise<ApiResponse<FlatNode>> => {
    return await api.put("/tree/rename", data);
};

export const favorite = async (ids: string[]): Promise<ApiResponse<FlatNode[]>> => {
    return await api.put("/tree/favorite", { ids });
};

export const updateParent = async (data: { parentId: string; nodesIds: string[]; }): Promise<ApiResponse<FlatNode[]>> => {
    return await api.put("/tree/update-parent", data);
};

export const restore = async (ids: string[]): Promise<ApiResponse<FlatNode[]>> => {
    return api.put("/tree/restore", ids);
};

export const trash = async (ids: string[]): Promise<ApiResponse<{ nodes: FlatNode[]; deleted: boolean }>> => {
    return api.put("/tree/trash", ids);
};

export const remove = async (ids: string[]): Promise<ApiResponse<{ nodes: FlatNode[]; deleted: boolean }>> => {
    return api.delete("/tree/delete", { data: ids });
};