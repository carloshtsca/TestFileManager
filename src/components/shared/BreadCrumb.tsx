import { Link } from "react-router-dom";

import { Home } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import { useTreeStore } from "@/store/treeStore";
import { useMemo } from "react";

interface BreadCrumbProps {
    id?: string | null;
}

export default function BreadCrumb({ id }: BreadCrumbProps) {
    const flatTree = useTreeStore(state => state.flatTree);
    const getBreadcrumb = useTreeStore(state => state.getBreadcrumb);

    const breadcrumb = useMemo(() => {
        if (!id) return [];
        return getBreadcrumb(id);
    }, [flatTree, id, getBreadcrumb]);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to="/my_files"><Home aria-hidden="true" size={16} /></Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>/</BreadcrumbSeparator>

                {breadcrumb.flatMap((b, index, arr) => {
                    const isLast = index === arr.length - 1;

                    const link = (
                        <BreadcrumbItem key={`item-${b.id}`}>
                            <BreadcrumbLink asChild>
                                <Link to={`/my_files/${b.id}`}>
                                    {b.name}
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    );

                    if (isLast) {
                        return [link];
                    }

                    return [
                        link,
                        <BreadcrumbSeparator key={`sep-${b.id}`}>/</BreadcrumbSeparator>
                    ];
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
