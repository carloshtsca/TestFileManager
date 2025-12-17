export interface TreeNode {
    id: string;
    type: "file" | "folder";
    name: string;
    children?: TreeNode[];
};

export interface FlatNode {
    id: string;
    type: string;
    name: string;
    parentId: string | null
};

// Árvore recursiva
export const treeData: TreeNode[] = [
    {
        id: "1",
        type: "folder",
        name: "images",
        children: [
            {
                id: "2",
                type: "folder",
                name: "jpg",
                children: [
                    { id: "3", type: "file", name: "Header.jsx" }
                ]
            },
            {
                id: "4",
                type: "folder",
                name: "jpeg",
                children: [
                    { id: "5", type: "file", name: "Header.jsx" }
                ]
            },
            {
                id: "6",
                type: "folder",
                name: "png",
                children: [
                    { id: "7", type: "file", name: "Header.jsx" }
                ]
            },
            {
                id: "8",
                type: "folder",
                name: "svg",
                children: [
                    {
                        id: "9",
                        type: "folder",
                        name: "png",
                        children: [
                            {
                                id: "10",
                                type: "folder",
                                name: "png",
                                children: [
                                    { id: "11", type: "file", name: "Header.jsx" }
                                ]
                            },
                            { id: "12", type: "file", name: "Header.jsx" }
                        ]
                    },
                    { id: "13", type: "file", name: "Header.jsx" }
                ]
            },
            { id: "14", type: "file", name: "index.js" }
        ]
    },

    {
        id: "15",
        type: "folder",
        name: "Enginnering",
        children: []
    },

    {
        id: "16",
        type: "folder",
        name: "Project",
        children: [
            {
                id: "17",
                type: "folder",
                name: "components",
                children: [
                    { id: "18", type: "file", name: "Header.jsx" }
                ]
            },
            { id: "19", type: "file", name: "Dona.js" },
            { id: "20", type: "file", name: "sdfwer.js" },
            { id: "21", type: "file", name: "infffdex.js" },
            { id: "22", type: "file", name: "insdsddex.js" },
            { id: "23", type: "file", name: "file.js" }
        ]
    },

    { id: "24", type: "file", name: "index.js" },
    { id: "25", type: "file", name: "index.js" },
    { id: "26", type: "file", name: "index.js" },
    { id: "27", type: "file", name: "index.js" },
    { id: "28", type: "file", name: "index.js" },
    { id: "29", type: "file", name: "index.js" },
    { id: "30", type: "file", name: "index.js" },
    { id: "31", type: "file", name: "index.js" },
    { id: "32", type: "file", name: "index.js" },
    { id: "33", type: "file", name: "index.js" }
];

// Árvore plana
export const flatTreeData: Array<FlatNode> = [
    { id: "1", type: "folder", name: "images", parentId: null },
    { id: "2", type: "folder", name: "jpg", parentId: "1" },
    { id: "3", type: "file", name: "Header.jsx", parentId: "2" },
    { id: "4", type: "folder", name: "jpeg", parentId: "1" },
    { id: "5", type: "file", name: "Header.jsx", parentId: "4" },
    { id: "6", type: "folder", name: "png", parentId: "1" },
    { id: "7", type: "file", name: "Header.jsx", parentId: "6" },
    { id: "8", type: "folder", name: "svg", parentId: "1" },
    { id: "9", type: "folder", name: "png", parentId: "8" },
    { id: "10", type: "folder", name: "png", parentId: "9" },
    { id: "11", type: "file", name: "Header.jsx", parentId: "10" },
    { id: "12", type: "file", name: "Header.jsx", parentId: "9" },
    { id: "13", type: "file", name: "Header.jsx", parentId: "8" },
    { id: "14", type: "file", name: "index.js", parentId: "1" },
    { id: "15", type: "folder", name: "Enginnering", parentId: null },
    { id: "16", type: "folder", name: "Project", parentId: null },
    { id: "17", type: "folder", name: "components", parentId: "16" },
    { id: "18", type: "file", name: "Header.jsx", parentId: "17" },
    { id: "19", type: "file", name: "Dona.js", parentId: "16" },
    { id: "20", type: "file", name: "sdfwer.js", parentId: "16" },
    { id: "21", type: "file", name: "infffdex.js", parentId: "16" },
    { id: "22", type: "file", name: "insdsddex.js", parentId: "16" },
    { id: "23", type: "file", name: "file.js", parentId: "16" },
    { id: "24", type: "file", name: "index.js", parentId: null },
    { id: "25", type: "file", name: "index.js", parentId: null },
    { id: "26", type: "file", name: "index.js", parentId: null },
    { id: "27", type: "file", name: "index.js", parentId: null },
    { id: "28", type: "file", name: "index.js", parentId: null },
    { id: "29", type: "file", name: "index.js", parentId: null },
    { id: "30", type: "file", name: "index.js", parentId: null },
    { id: "31", type: "file", name: "index.js", parentId: null },
    { id: "32", type: "file", name: "index.js", parentId: null },
    { id: "33", type: "file", name: "index.js", parentId: null },
];

// Format: flat -> recurse
export function unflattenTree(flatData: FlatNode[]): TreeNode[] {
    const idMap: Record<string, TreeNode> = {};
    const tree: TreeNode[] = [];

    // Primeiro cria todos os nós sem children
    flatData.forEach(node => {
        idMap[node.id] = {
            id: node.id,
            type: node.type as "file" | "folder",
            name: node.name
        };
    });

    // Depois monta a hierarquia
    flatData.forEach(node => {
        const treeNode = idMap[node.id];
        if (node.parentId === null) {
            // Nó raiz
            tree.push(treeNode);
        } else {
            const parentNode = idMap[node.parentId];
            if (!parentNode.children) {
                parentNode.children = [];
            }
            parentNode.children.push(treeNode);
        }
    });

    return tree;
};
