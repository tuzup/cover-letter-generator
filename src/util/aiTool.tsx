
import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import fetch, { Headers } from 'node-fetch';

import { environment, getPreferenceValues, LocalStorage } from "@raycast/api";
import config = require("../config.json");
import path = require("path");

// @ts-ignore
global.fetch = fetch;
// @ts-ignore
global.Headers = Headers;
const prompt = config.prompt;
const resumePath = path.join(environment.supportPath, config.resumePath);
const apiKey = getPreferenceValues().apiKey;



export async function generateCoverLetter(jobDesctiption : string) : Promise<string> {

   try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const fileManager = new GoogleAIFileManager(apiKey);
      const model = genAI.getGenerativeModel({
         model: "gemini-1.5-flash",
         systemInstruction: prompt,
      });
      const uploadResponse = await fileManager.uploadFile(resumePath, {
         mimeType: "application/pdf",
         displayName: "ResumePDF",
      });
      const result = await model.generateContent([
         {
            fileData: {
               mimeType: uploadResponse.file.mimeType,
               fileUri: uploadResponse.file.uri,
            },
         },
         { text: `<jobDescription> ${jobDesctiption} </jobDescription>` },
         { text: `Date : ${new Date().toString()}` },
      ]);
      const response = result.response.text();
      const JSONString = response.startsWith("```json") ? response.slice(7, -4) : response;
      return JSONString;
   } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error("Failed to generate cover letter");
   }
}