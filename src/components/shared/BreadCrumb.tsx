import { Link, useLocation } from "react-router-dom";

import { Home } from "lucide-react";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

import { useTreeStore } from "@/store/treeStore";
import { useMemo } from "react";

interface BreadCrumbProps {
    id?: string | null;
    viewName?: string;
}

export default function BreadCrumb({ id, viewName }: BreadCrumbProps) {
    const location = useLocation();

    const flatTree = useTreeStore(state => state.flatTree);
    const getBreadcrumb = useTreeStore(state => state.getBreadcrumb);

    const breadcrumb = useMemo(() => {
        if (!id) return [];
        return getBreadcrumb(id);
    }, [flatTree, id, getBreadcrumb]);

    const basePath = "/" + location.pathname.split("/")[1];

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link to={basePath}><Home aria-hidden="true" size={16} /></Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                <BreadcrumbSeparator>/</BreadcrumbSeparator>

                {/* View especial */}
                {viewName && (
                    <>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={basePath}>{viewName}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator>/</BreadcrumbSeparator>
                    </>
                )}

                {breadcrumb.flatMap((b, index, arr) => {
                    const isLast = index === arr.length - 1;

                    const link = (
                        <BreadcrumbItem key={`item-${b.id}`}>
                            <BreadcrumbLink asChild>
                                {/* <Link to={`/my_files/${b.id}`}>
                                    {b.name}
                                </Link> */}
                                <Link to={`${basePath}/${b.id}`}>{b.name}</Link>
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
