
import OpenAI from "openai";
console.log("OpenAI import success");
try {
    const client = new OpenAI({ apiKey: "test" });
    console.log("OpenAI constructor success");
} catch (e) {
    console.error("OpenAI error:", e.message);
}
