interface TableSkeletonProps {
    rows?: number;
    columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, rowIdx) => (
                <tr key={rowIdx} className="animate-pulse">
                    {Array.from({ length: columns }).map((__, colIdx) => (
                        <td key={colIdx} className="px-6 py-4">
                            <div className="h-4 w-full max-w-[140px] rounded bg-gray-200/80" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}