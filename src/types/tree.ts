export interface Breadcrumb {
    id: string;
    name: string;
};

export interface FlatNode {
    id: string;
    userId: string;
    parentId: string | null;
    publicId: string | null;
    type: "file" | "folder";
    name: string;
    color: string | null;
    url: string | null;
    breadcrumb: Breadcrumb[],
    size: number;
    contentType: string | null;
    resourceType: string;
    isExpanded: boolean;
    isFavorite: boolean;
    deletedAt: string | null;
    createdAt: string;
    updatedAt: string;
};

export interface TreeNode {
    id: string;
    type: "file" | "folder";
    name: string;
    color: string | null;
    isFavorite: boolean;
    children?: TreeNode[];
};

// Format: flat -> recursive
// ignora os filhos que o pai não existe com o mesmo parentId
// export function unflattenTree(flatData: FlatNode[]): TreeNode[] {
//     const idMap: Record<string, TreeNode> = {};
//     const tree: TreeNode[] = [];

//     // Primeiro cria todos os nós sem children
//     flatData.forEach(node => {
//         idMap[node.id] = {
//             id: node.id,
//             type: node.type as "file" | "folder",
//             name: node.name,
//         };
//     });

//     // Monta a hierarquia, removendo nós órfãos
//     flatData.forEach(node => {
//         const treeNode = idMap[node.id];
//         if (!treeNode) return;

//         if (node.parentId === null) {
//             // Nó raiz → adiciona
//             tree.push(treeNode);
//         } else {
//             const parentNode = idMap[node.parentId];
//             if (parentNode) {
//                 // Pai existe → adiciona como filho
//                 if (!parentNode.children) parentNode.children = [];
//                 parentNode.children.push(treeNode);
//             }
//             // Pai não existe → nó órfão → ignora
//         }
//     });

//     return tree;
// }

export function unflattenTree(flatData: FlatNode[]): TreeNode[] {
    const idMap: Record<string, TreeNode> = {};
    const tree: TreeNode[] = [];

    // Cria todos os nós
    flatData.forEach(node => {
        idMap[node.id] = {
            id: node.id,
            type: node.type,
            name: node.name,
            color: node.color,
            isFavorite: node.isFavorite,
        };
    });

    // Monta a hierarquia
    flatData.forEach(node => {
        const treeNode = idMap[node.id];
        if (!treeNode) return;

        if (node.parentId === null) {
            tree.push(treeNode);
        } else {
            const parentNode = idMap[node.parentId];
            if (parentNode) {
                if (!parentNode.children) parentNode.children = [];
                parentNode.children.push(treeNode);
            }
        }
    });

    // 🔽 Função de ordenação recursiva
    const sortTree = (nodes: TreeNode[]) => {
        nodes.sort((a, b) => {
            // pastas primeiro
            if (a.type !== b.type) {
                return a.type === "folder" ? -1 : 1;
            }

            // depois por nome
            return a.name.localeCompare(b.name);
        });

        // ordena os filhos
        nodes.forEach(node => {
            if (node.children) {
                sortTree(node.children);
            }
        });
    };

    // ordena raiz + filhos
    sortTree(tree);

    return tree;
}

export function buildBreadcrumb(nodeId: string, flatTree: FlatNode[]): FlatNode[] {
    const map = new Map(flatTree.map(n => [n.id, n]));

    const breadcrumb: FlatNode[] = [];
    let current = map.get(nodeId);

    while (current) {
        breadcrumb.unshift(current);
        current = current.parentId ? map.get(current.parentId) : undefined;
    }

    return breadcrumb;
};

export function formatNodes(nodes: FlatNode[]): FlatNode[] {
    return [...nodes].sort((a, b) => {
        // Pastas primeiro
        if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
        }

        // Depois por nome
        return a.name.localeCompare(b.name);
    });
};