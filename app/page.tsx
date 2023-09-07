"use client";
import { useState } from "react";
import OpenAI from "openai";
import { extractAnswers } from "@/utils/utils";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string[]>([]);

  const handleButtonClick = async () => {
    const openai = new OpenAI({
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });
    try {
      const result: any = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a grammar checker and answer generator. Provide suggestions to improve the following sentence and then provide two different answers to the question.",
          },
          {
            role: "user",
            content: `${prompt}`,
          },
        ],
        temperature: 0,
        max_tokens: 256,
      });
      console.log(result?.choices[0].message.content);
      setResponse(extractAnswers(result?.choices[0].message.content));
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 w-full">
      <div className="w-full">
        <input
          type="text"
          placeholder="Enter your prompt"
          onChange={(e) => setPrompt(e.target.value)}
          className="border rounded-md py-2 px-3 w-full focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleButtonClick}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Make Request
        </button>
        {response.length > 0 && (
          <h5 className="text-lg font-semibold mt-20 mb-10"> Response:</h5>
        )}
        {response.map((item, index) => (
          <>
            <h6 className="font-semibold underline mt-10">
              Solution: {index + 1}
            </h6>
            <p key={index} className="w-100 text-lg ">
              {item}
            </p>
          </>
        ))}
      </div>
    </main>
  );
}
