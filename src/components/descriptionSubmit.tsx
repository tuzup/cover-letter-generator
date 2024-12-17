import { Action, ActionPanel, Detail, environment, getSelectedText, showToast, Toast, useNavigation } from "@raycast/api";
import path from "path";
const fs = require('fs');
import { useEffect, useState } from "react";
import config = require("../config.json");
import { generateCoverLetter } from "../util/aiTool";
import DisplayCoverLetter from "./displayCoverLetter";
import ResumeUpload from "./resumeUpload";
import { CoverLetterInfo } from "../type";
import { storeCoverLetter } from "../util/storage";


export default function DescriptionSubmit() {
    const { push } = useNavigation();
    const [jobDescription, setJobDescription] = useState(" ");
    const [isLoading, setisLoading] = useState(true);
    const [resumeMetadata, setResumeMetadata] = useState({
        originalName: "",
        storedName: "",
        uploadDate: "",
        description: "",
    });
    const loading_gif = path.join(environment.assetsPath, "loading.gif");
    const resumePath = path.join(environment.supportPath, config.resumePath);
    const metadataPath = path.join(environment.supportPath, config.metadataPath);

    async function handleGenerate() {
        try{
        setisLoading(true);
        await showToast({ title: "Generating Cover Letter", style: Toast.Style.Animated });
        const response = await generateCoverLetter(jobDescription);
        const responseJson  = JSON.parse(response);
        if(responseJson?.status === "fail"){
            await showToast({ title: "Error", message: responseJson?.error_message, style: Toast.Style.Failure });
            return;
        }
        const info : CoverLetterInfo = {
            _id: `${Date.now()}`,
            companyName: responseJson.company_name,
            jobTitle: responseJson.job_title,
            jobDescription: jobDescription,
            matchScore: responseJson.match_score,
            topSkills: responseJson.top_skills,
            coverLetter: responseJson.cover_letter,
            pdfPath: "",
            createdDate: Date.now().toString(),
        }
        const coverLetterID = await storeCoverLetter(info);
        push(<DisplayCoverLetter data={info} />);
        await showToast({ title: "Cover Letter Generated", style: Toast.Style.Success });
        setisLoading(false);
    }catch(error){
        console.error(error);
        await showToast({ title: "Error", message: "Failed to generate cover letter", style: Toast.Style.Failure });
    }
}

    useEffect(() => {
        (async () => {
            try {
                const metadata = fs.readFileSync(metadataPath, "utf-8");
                const data = JSON.parse(metadata);
                setResumeMetadata(data);
                showToast({ title: "Loading..", style: Toast.Style.Animated });
                let selectedText = await getSelectedText();
                setJobDescription(selectedText);
                if (selectedText) {
                    setisLoading(false);
                    showToast({ title: "Job description loaded", style: Toast.Style.Success });
                }
            } catch (error) {
                console.error(error);
                setisLoading(true);
                setJobDescription("");
                showToast({
                    title: "Error fetching job description",
                    style: Toast.Style.Failure,
                });
                setisLoading(false);
            }
        })();
    }, [jobDescription]);

    if(isLoading){
        showToast({ title: "Loading..", style: Toast.Style.Animated });
        return <Detail markdown={""}  isLoading={true}/>;
    }
    return(
        <Detail markdown={jobDescription}
            navigationTitle="Cover Letter Maker"
            isLoading={isLoading}
            actions={
                <ActionPanel title="Cover Letter Maker">
                    <Action title="Generate Cover Letter" shortcut={{ modifiers: ["cmd"], key: "g" }} onAction={handleGenerate} />
                    <Action title="Change Resume" shortcut={{ modifiers: ["cmd"], key: "return" }} onAction={() => push(<ResumeUpload />)} />
                    <Action.Open title="Open Resume" target={resumePath} shortcut={{ modifiers: ["cmd"], key: "y" }} />
                </ActionPanel>
            }
            metadata={
                <Detail.Metadata>
                    <Detail.Metadata.TagList title="Resume">
                        <Detail.Metadata.TagList.Item text={resumeMetadata.originalName}  />
                        <Detail.Metadata.TagList.Item text={`Date: ${resumeMetadata.uploadDate}`}  />
                    </Detail.Metadata.TagList>
                    {resumeMetadata.description !== "" &&
                        <Detail.Metadata.Label title="Description" text={resumeMetadata.description} />}
                    <Detail.Metadata.Separator />
                    <Detail.Metadata.TagList title="Actions">
                        <Detail.Metadata.TagList.Item text="Change Resume ⌘ ⏎" onAction={() => push(<ResumeUpload />)} />  
                        <Detail.Metadata.TagList.Item text="Open Resume ⌘ Y" /> 
                    </Detail.Metadata.TagList>
                </Detail.Metadata>  
            }
        />
    );
}