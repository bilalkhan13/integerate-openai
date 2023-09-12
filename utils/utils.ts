export function extractAnswers(text: string) {
  // Split the text into individual lines
  const lines = text.split('\n');

  // Initialize an array to store the answers
  const answers = [];

  // Initialize a variable to store the current answer text
  let currentAnswer = '';

  // Iterate through the lines to extract answers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim(); // Remove leading and trailing whitespace

    // Check if the line starts with "Answer X:" (where X is a number)
    const answerMatch = line.match(/^Solution (\d+):/);
    if (answerMatch) {
      // If a new answer is found, push the current answer text to the answers array
      if (currentAnswer !== '') {
        answers.push(currentAnswer);
      }

      // Initialize the current answer with the text after "Answer X:"
      currentAnswer = line.substring(answerMatch[0].length).trim();
    } else {
      // If it's not an "Answer X:" line, append it to the current answer text
      currentAnswer += '\n' + line;
    }
  }

  // Push the last answer (if any) to the answers array
  if (currentAnswer !== '') {
    answers.push(currentAnswer);
  }

  console.log('ans:', answers);

  return answers;
}


// spellingCorrectionApi.ts
import axios from 'axios';

export const spellingCorrectionApi = async (text: string) => {
  try {
    const response = await axios.post('/api/spell-check',  {
      text
    });

    if (response.data) {
      return response.data;
    } else {
      throw new Error('Unable to fetch suggestions');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};
