
import { GoogleGenAI } from "@google/genai";

try {
    console.log("Import success");
    const client = new GoogleGenAI({ apiKey: "test" });
    console.log("Constructor success");
} catch (e) {
    console.error("Error:", e.message);
    if (e.message.includes("is not a constructor")) {
        console.log("GoogleGenAI is not a constructor in @google/genai");
    }
}
