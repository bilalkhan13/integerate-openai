"use client";
import { useEffect, useState, useRef } from "react";
import OpenAI from "openai";
import { extractAnswers } from "@/utils/utils";
import "dotenv/config";

export default function Home() {
  const inputField = useRef<HTMLInputElement | null>(null);
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<string[]>([]);
  const [inputTimer, setInputTimer] = useState<NodeJS.Timeout | null>(null);
  const [showPopover, setShowPopover] = useState(false);

  console.log(process.env.OPENAI_API_KEY);

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
              "You are a grammar checker and similar prompts generator. Provide me a sentence after grammar correction if grammar is wrong if not wrong and then provide two different improvement of the prompt this is the must. Improvement should start after -> Solution [number]:",
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

  const handleSuggestion = () => {
    if (inputField.current && response.length === 3)
      inputField.current.value = response[0];
    setShowPopover(false);
  };

  useEffect(() => {
    if (response.length === 3) {
      setShowPopover(true); // Show the popover when response length is three
    } else {
      setShowPopover(false); // Hide the popover otherwise
    }
  }, [response]);

  useEffect(() => {
    if (!prompt) {
      setResponse([]);
    }

    // Clear the previous timer when input value changes
    if (inputTimer) {
      clearTimeout(inputTimer);
    }
    // Start a new timer when input value changes
    setInputTimer(
      setTimeout(() => {
        if (prompt) {
          handleButtonClick();
        }
      }, 3000) // 3000 milliseconds = 3 seconds
    );

    // Clean up the timer on component unmount
    return () => {
      if (inputTimer) {
        clearTimeout(inputTimer);
      }
    };
  }, [prompt]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 w-full">
      <div className="w-full mt-40 relative">
        {showPopover && (
          <div className="popover absolute z-10 w-full mt-[-95px] bg-gray-100 border border-gray-300 rounded shadow-lg ">
            <div className="p-4 ">
              <p className="font-semibold">
                Corrected Sentence{" "}
                <span className="text-sm">(click sentence to add)</span>:
              </p>
              <p className="cursor-pointer" onClick={handleSuggestion}>
                {response[0]}
              </p>
            </div>
          </div>
        )}
        <input
          ref={inputField}
          type="text"
          placeholder="Enter your prompt"
          onChange={handleChange}
          className="border rounded-md py-2 px-3 w-full focus:outline-none focus:border-blue-500"
        />
        {/* <button
          onClick={handleButtonClick}
          className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Make Request
        </button> */}
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
