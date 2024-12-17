import { useEffect, useState } from "react";
import CoverLetterHistory from "./components/historyCoverLetter";
import { deleteCoverLetterHistory, getCoverLetterHistory } from "./util/storage";
import { CoverLetterInfo } from "./type";
import { Detail } from "@raycast/api";


export default function Command() {
    const [coverLettrs, setCoverLettrs] = useState<CoverLetterInfo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchCoverLetterHistory = async () => {
            const history = await getCoverLetterHistory();
            setCoverLettrs(history);
            setIsLoading(false);
        };
        fetchCoverLetterHistory();
        
    }, []);

    if (isLoading) {
        return <Detail markdown={""} />;
    }
    
    return (<CoverLetterHistory data={coverLettrs} />);
}