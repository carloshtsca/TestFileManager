import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { FlatNode } from "@/types/tree";
import type { ApiResponse } from "@/api/client";
import type { AddFolderFormValues } from "@/schemas/addFolder";

import { addFolder, favorite, getFlatTree, remove, rename, trash, updateParent, upload, type UpdateParentValues, type UploadValues } from "@/api/services/treeService";

import type { RenameFormValues } from "@/schemas/rename";

interface TreeStore {
    flatTree: FlatNode[];
    status: {
        blocking: { loading: boolean },
        get: { loading: boolean },
        upload: { loading: boolean },
        post: { loading: boolean },
        put: { loading: boolean },
        delete: { loading: boolean },
    };

    getFlatTree: (deleted?: boolean) => Promise<ApiResponse<FlatNode[]>>;
    addFolder: (data: AddFolderFormValues) => Promise<ApiResponse<FlatNode>>;
    upload: (data: UploadValues) => Promise<ApiResponse<FlatNode[]>>;
    rename: (data: RenameFormValues) => Promise<ApiResponse<FlatNode>>;
    favorite: (ids: string[]) => Promise<ApiResponse<FlatNode[]>>;
    updateParent: (data: UpdateParentValues) => Promise<ApiResponse<FlatNode[]>>;
    trash: (ids: string[]) => Promise<ApiResponse<{ nodes: FlatNode[]; deleted: boolean }>>;
    remove: (ids: string[]) => Promise<ApiResponse<{ nodes: FlatNode[]; deleted: boolean }>>;

    // 🔹 filters:
    getActiveNodes: () => FlatNode[];
    getDeletedNodes: () => FlatNode[];
    getBreadcrumb: (nodeId: string | null) => FlatNode[];
    getClosestActiveNodeId: (nodeId: string | null) => string | null;
};

export const useTreeStore = create<TreeStore>()(
    devtools((set, get) => ({
        flatTree: [],
        status: {
            blocking: { loading: false },
            get: { loading: false },
            upload: { loading: false },
            post: { loading: false },
            put: { loading: false },
            delete: { loading: false },
        },

        getFlatTree: async (deleted = false) => {
            set(state => ({ status: { ...state.status, get: { ...state.status.get, loading: true }, }, }));

            try {
                const response = await getFlatTree(deleted);

                set(state => ({
                    flatTree: response.data ?? [],
                    status: { ...state.status, get: { ...state.status.get, loading: false }, },
                }));

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, get: { ...state.status.get, loading: false }, }, }));
                throw err;
            }
        },

        addFolder: async (data: AddFolderFormValues) => {
            set(state => ({ status: { ...state.status, post: { loading: true }, }, }));

            try {
                const response = await addFolder(data);

                set(state => ({
                    flatTree: [...state.flatTree, response.data],
                    status: { ...state.status, post: { loading: false }, },
                }));

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, post: { loading: false }, }, }));
                throw err;
            }
        },

        rename: async (data: RenameFormValues) => {
            set(state => ({ status: { ...state.status, put: { loading: true }, }, }));

            try {
                const response = await rename(data);

                set(state => ({
                    flatTree: state.flatTree.map(node =>
                        node.id === response.data.id ? response.data : node
                    ),
                    status: { ...state.status, put: { loading: false } },
                }));

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, put: { loading: false }, }, }));
                throw err;
            }
        },

        favorite: async (ids: string[]) => {
            set(state => ({ status: { ...state.status, put: { loading: true }, }, }));

            try {
                const response = await favorite(ids);

                set(state => {
                    const updatedNodesMap = new Map(response.data.map(node => [node.id, node]));

                    return {
                        flatTree: state.flatTree.map(node => updatedNodesMap.get(node.id) ?? node),
                        status: { ...state.status, blocking: { loading: false } },
                    };
                });

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, put: { loading: false }, }, }));
                throw err;
            }
        },

        upload: async (data: UploadValues) => {
            set(state => ({ status: { ...state.status, blocking: { loading: true }, }, }));

            try {
                const response = await upload(data);

                set(state => ({
                    flatTree: [...state.flatTree, ...response.data],
                    status: { ...state.status, blocking: { loading: false }, },
                }));

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, blocking: { loading: false }, }, }));
                throw err;
            }
        },

        updateParent: async (data: UpdateParentValues) => {
            set(state => ({ status: { ...state.status, blocking: { loading: true } }, }));

            try {
                const response = await updateParent(data);

                set(state => {
                    const updatedNodesMap = new Map(response.data.map(node => [node.id, node]));

                    return {
                        flatTree: state.flatTree.map(node => updatedNodesMap.get(node.id) ?? node),
                        status: { ...state.status, blocking: { loading: false } },
                    };
                });

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, blocking: { loading: false } }, }));
                throw err;
            }
        },

        trash: async (ids: string[]) => {
            set(state => ({ status: { ...state.status, delete: { loading: true } } }));

            try {
                const response = await trash(ids);

                if (response.data.nodes?.length) {
                    set(state => {
                        const updatedNodesMap = new Map(response.data.nodes.map(node => [node.id, node]));

                        return {
                            flatTree: state.flatTree.map(node => updatedNodesMap.get(node.id) ?? node),
                            status: { ...state.status, delete: { loading: false } },
                        };
                    });
                } else {
                    set(state => ({ status: { ...state.status, delete: { loading: false } } }));
                }

                return response;
            } catch (err: any) {
                set(state => ({ status: { ...state.status, delete: { loading: false } } }));
                throw err;
            }
        },

        remove: async (ids: string[]) => {
            set(state => ({ status: { ...state.status, delete: { loading: true } } }));

            try {
                const response = await remove(ids);

                if (response.data.nodes?.length) {
                    const deletedIds = new Set(
                        response.data.nodes.map(node => node.id)
                    );

                    set(state => ({
                        flatTree: state.flatTree.filter(
                            node => !deletedIds.has(node.id)
                        ),
                        status: { ...state.status, delete: { loading: false } },
                    }));
                } else {
                    set(state => ({
                        status: { ...state.status, delete: { loading: false } },
                    }));
                }

                return response;
            } catch (err: any) {
                set(state => ({
                    status: { ...state.status, delete: { loading: false } },
                }));
                throw err;
            }
        },

        // Filters:
        getBreadcrumb: (nodeId: string | null) => {
            if (!nodeId) return [];

            const map = new Map(get().flatTree.map(n => [n.id, n]));

            const breadcrumb: FlatNode[] = [];
            let current = map.get(nodeId);

            // se o id não existe (rota inválida), retorna vazio
            if (!current) return [];

            while (current) {
                breadcrumb.unshift(current);
                current = current.parentId
                    ? map.get(current.parentId)
                    : undefined;
            }

            return breadcrumb;
        },

        getActiveNodes: () => {
            return get().flatTree.filter(node => node.deletedAt === null);
        },

        getDeletedNodes: () => {
            return get().flatTree.filter(node => node.deletedAt !== null);
        },

        getClosestActiveNodeId: (nodeId: string | null): string | null => {
            if (!nodeId) return null;

            const nodes = get().flatTree;
            const map = new Map(nodes.map(n => [n.id, n]));

            let current = map.get(nodeId);

            while (current) {
                // achou um node ativo
                if (current.deletedAt === null) {
                    return current.id;
                }

                // sobe para o pai
                current = current.parentId
                    ? map.get(current.parentId)
                    : undefined;
            }

            // nenhum ativo encontrado → raiz
            return null;
        },
    })),
);