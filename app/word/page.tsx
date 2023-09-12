// 'use client'
// import React, { useState, useEffect, useRef } from 'react';
// import ContentEditable from 'react-contenteditable';
// import OpenAI from 'openai';

// const apiKey = 'YOUR_OPENAI_API_KEY';

// interface SpellCheckerProps {}

// interface Suggestion {
//   wrong: string;
//   suggestions: string[];
// }

// const SpellChecker: React.FC<SpellCheckerProps> = () => {
//   const [editorHtml, setEditorHtml] = useState<string>('');
//   const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
//   const contentEditable = useRef(null);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       // Spell check the text after the user stops typing for 3 seconds
//       spellCheck(editorHtml).then((suggestions) => {
//         setSuggestions(suggestions);
//       });
//     }, 3000);

//     return () => clearTimeout(timer);
//   }, [editorHtml]);

//   const spellCheck = async (text: string): Promise<Suggestion[]> => {

//     const openai = new OpenAI({
//       apiKey: "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",
//       dangerouslyAllowBrowser: true,
//     });
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a grammar checker and spell sheck the following:",
//           },
//           {
//             role: "user",
//             content: `${prompt}`,
//           },
//         ],
//         temperature: 0,
//         max_tokens: 256,
//       });

//       const correctedText = response.choices[0];
//       return parseSuggestions(correctedText);
//     } catch (error) {
//       console.error('Error:', error);
//       return [];
//     }
//   };

//   const parseSuggestions = (correctedText: string): Suggestion[] => {
//     // Implement logic to parse and extract suggestions from correctedText
//     const suggestions: Suggestion[] = [];
//     const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
//     let match;
    
//     while ((match = regex.exec(correctedText)) !== null) {
//         suggestions.push({
//           wrong: match[1],
//           suggestions: match[2].split(',').map((suggestion) => suggestion.trim()),
//         });
//     }
    
//     return suggestions;
//   };

//   const addSuggestion = (suggestion: Suggestion) => {
//     // Implement a function to add the suggestion to the editor content
//     // For example, you can replace the misspelled word with the selected suggestion
//     const updatedHtml = editorHtml.replace(
//       new RegExp(suggestion.wrong, 'g'),
//       suggestion.suggestions[0]
//     );
//     setEditorHtml(updatedHtml);
//   };

//   return (
//     <div>
//       <ContentEditable
//         innerRef={contentEditable}
//         html={editorHtml}
//         disabled={false}
//         onChange={(e) => setEditorHtml(e.target.value)}
//         tagName='article'
//       />
//       {/* <div>
//         {suggestions.map((suggestion, index) => (
//           <div key={index}>
//             <span style={{ textDecoration: 'underline', color: 'red' }}>{suggestion.wrong}</span>
//             {suggestion.suggestions.map((suggestionText, i) => (
//               <button
//                 key={i}
//                 onClick={() => addSuggestion(suggestion)}
//               >
//                 {suggestionText}
//               </button>
//             ))}
//           </div>
//         ))}
//       </div> */}
//     </div>
//   );
// };

// export default SpellChecker;

import React, { useState, useEffect, useRef } from 'react';
import debounce from 'lodash/debounce';
import ReactHtmlParser from 'react-html-parser';
import { spellingCorrectionApi } from '@/utils/utils';

interface Props {
  placeholder?: string;
  name: string;
}

export const SpellingCorrectionInput: React.FC<Props> = ({ placeholder, name }) => {
  const [inputValue, setInputValue] = useState('');
  const [openPopover, setOpen] = useState(false);
  const [popoverRef, setPopoverRef] = useState<HTMLSpanElement | null>(null);
  const [correctionSuggestions, setCorrectionSuggestions] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState('');

  const renderedInput = useRef<any>(null);

  const debouncedSave = useRef(debounce((nextValue: any) => checkSpelling(nextValue), 3000)).current;

  const onChangeHandler = (event: any) => {
    debouncedSave(event.target.value);
    setInputValue(event.target.value);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const checkSpelling = async (word: string) => {
    // Here you'll call your spelling correction Api
    const mistakes = await spellingCorrectionApi(word);
    // Assuming mistakes would be an array of strings (words)
    const renderedContent = mistakes.reduce(
      (content: any, wordMistake: any) => content.replace(wordMistake, `<span class="underline cursor-pointer">${wordMistake}</span>`),
      inputValue
    );
    renderedInput.current = renderedContent;
  };

  const handleClick = async (event: any) => {
    setPopoverRef(event.target);
    setOpen(true);
    const wordToCorrect = event.target.textContent;
    setSelectedWord(wordToCorrect);
    const suggestions = await spellingCorrectionApi(wordToCorrect);
    setCorrectionSuggestions(suggestions);
  };

  const applySuggestion = (suggestedWord: string) => {
    const newValue = inputValue.replace(selectedWord, suggestedWord);
    setInputValue(newValue);
    handleClose();
  };

  return (
    <div>
      <textarea
        placeholder={placeholder}
        className="w-full p-2 border border-gray-200 rounded"
        onChange={(event) => onChangeHandler(event)}
        name={name}
        value={inputValue}
      />
      {ReactHtmlParser(renderedInput.current, {
        transform: (node: any, index: any) => {
          if (node.type === 'tag' && node.name === 'span') {
            return <span key={index} onClick={handleClick}>{node.children[0].data}</span>;
          }
        }
      })}

      <div
        className={`absolute bg-white border border-gray-200 p-2 rounded ${openPopover ? 'block' : 'hidden'}`}
        ref={setPopoverRef}
      >
        {correctionSuggestions.map((suggestedWord, index) => (
          <button
            key={index}
            className="block p-2 hover:bg-blue-500 hover:text-white rounded cursor-pointer"
            onClick={() => applySuggestion(suggestedWord)}
          >
            {suggestedWord}
          </button>
        ))}
      </div>
    </div>
  );
};