import { Action, getPreferenceValues } from "@raycast/api";
import OpenAI from 'openai';

const preferences = getPreferenceValues();



export default function GenerateAction() {

    const openai = new OpenAI({
        apiKey: preferences.apiKey,
    });

    async function generateCoverLetter(pdfPath: string) {
        console.log("Generating cover letter");

        console.log("PDF uploaded");

    }

    async function handleSubmit(values: { files: string[]; description: string } ) {
        console.log("Generating cover letter");
        console.log(values.files[0]);
        await generateCoverLetter(values.files[0]);
        
    }

    return (<Action.SubmitForm
        title="Generate Cover Letter"
        onSubmit={handleSubmit}
    />)
}
