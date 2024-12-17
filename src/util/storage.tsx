import { environment, LocalStorage } from "@raycast/api";
import { CoverLetterInfo } from "../type";
import config = require("../config.json");
import fs from "fs";
import path = require("path");

export async function storeCoverLetter(coverLetterInfo: CoverLetterInfo): Promise<string> {
    let existingInfo = await LocalStorage.getItem("coverLetterHistory");

    if (existingInfo) {
        let existingInfoJson: CoverLetterInfo[] = JSON.parse(existingInfo.toString());
        if (Array.isArray(existingInfoJson)) {
            existingInfoJson.unshift(coverLetterInfo);
        } else {
            existingInfoJson = [coverLetterInfo];
        }
        await LocalStorage.setItem("coverLetterHistory", JSON.stringify(existingInfoJson));
    } else {
        await LocalStorage.setItem("coverLetterHistory", JSON.stringify([coverLetterInfo]));
    }

    return coverLetterInfo._id;
}

export async function getCoverLetterHistory() : Promise<CoverLetterInfo[]>{
    let existingInfo = await LocalStorage.getItem("coverLetterHistory");
    if(existingInfo){
        let existingInfoJson = JSON.parse(existingInfo.toString());
        return existingInfoJson;
    }else{
        return [];
    }
}

export async function deleteCoverLetterHistory() : Promise<void>{
    const coverLetterPath = path.join(environment.supportPath,config.coverLetterPath);
    LocalStorage.removeItem("coverLetterHistory");
    if (fs.existsSync(coverLetterPath)) {
        fs.rmSync(coverLetterPath, { recursive: true });
    }
}

export async function getCoverLetterById(id: string) : Promise<CoverLetterInfo | null>{
    let existingInfo = await LocalStorage.getItem("coverLetterHistory");
    if(existingInfo){
        let existingInfoJson = JSON.parse(existingInfo.toString());
        let info = existingInfoJson.find((info: CoverLetterInfo) => info._id === id);
        return info;
    }else{
        return null;
    }
}

export async function deleteCoverLetterById(id: string) : Promise<CoverLetterInfo[]>{
    let existingInfo = await LocalStorage.getItem("coverLetterHistory");
    if(existingInfo){
        let existingInfoJson = JSON.parse(existingInfo.toString());
        let infoToDelete = existingInfoJson.find((info: CoverLetterInfo) => info._id === id);
        if (infoToDelete && infoToDelete.pdfPath) {
            if (fs.existsSync(infoToDelete.pdfPath)) {
            fs.unlinkSync(infoToDelete.pdfPath);
            }
        }
        let updatedInfo = existingInfoJson.filter((info: CoverLetterInfo) => info._id !== id);
        await LocalStorage.setItem("coverLetterHistory", JSON.stringify(updatedInfo));
        return updatedInfo;
    }
    return [];
}

export async function updateCoverLetter(coverLetterInfo: CoverLetterInfo) : Promise<void>{
    let existingInfo = await LocalStorage.getItem("coverLetterHistory");
    if(existingInfo){
        let existingInfoJson = JSON.parse(existingInfo.toString());
        let updatedInfo = existingInfoJson.map((info: CoverLetterInfo) => {
            if(info._id === coverLetterInfo._id){
                return coverLetterInfo;
            }else{
                return info;
            }
        });
        await LocalStorage.setItem("coverLetterHistory", JSON.stringify(updatedInfo));
    }
}