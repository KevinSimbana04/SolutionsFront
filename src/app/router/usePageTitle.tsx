import { useEffect } from "react";

export default function UsePageTitle(title: string) {
    useEffect(() => {

        const previousTitle = document.title;
        document.title = `Int-Solutions - ${title}`;

        return () => {
            document.title = previousTitle;
        }
    }, [title])

}