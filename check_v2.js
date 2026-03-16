
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY_1 || process.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function testModel() {
    try {
        console.log("Testing gemini-2.0-flash...");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        await model.generateContent("Test");
        console.log("SUCCESS: gemini-2.0-flash is working!");
    } catch (error) {
        console.log("FAILED gemini-2.0-flash:", error.message);
    }
}

testModel();
