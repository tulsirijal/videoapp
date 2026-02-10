
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateDescription = async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Video title is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `Write a professional, SEO-friendly YouTube video description for a video titled: "${title}". 
    Include a hook at the beginning, a brief overview of what the video might cover, and some relevant hashtags at the end. 
    Keep it under 150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ description: text });
  } catch (error) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({ message: "Failed to generate description" });
  }
};

export { generateDescription };