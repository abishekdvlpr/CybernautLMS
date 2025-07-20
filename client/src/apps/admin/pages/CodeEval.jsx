// CodeEval.jsx
import React, { useState } from "react";
import axios from "axios";

const languages = [
  { id: 50, name: "C (GCC 9.2.0)" },
  { id: 54, name: "C++ (GCC 9.2.0)" },
  { id: 62, name: "Java (OpenJDK 13.0.1)" },
  { id: 71, name: "Python (3.8.1)" },
  { id: 63, name: "JavaScript (Node.js 12.14.0)" },
  { id: 51, name: "C# (Mono 6.6.0.161)" },
  { id: 60, name: "Go (1.13.5)" },
  { id: 68, name: "PHP (7.4.1)" },
  { id: 73, name: "Ruby (2.7.0)" },
  { id: 74, name: "Rust (1.40.0)" },
  { id: 43, name: "Assembly (NASM 2.14.02)" },
  { id: 46, name: "Bash (5.0.0)" },
  { id: 52, name: "Common Lisp (SBCL 2.0.0)" },
  { id: 61, name: "Haskell (GHC 8.8.1)" },
  { id: 64, name: "Kotlin (1.3.70)" },
  { id: 65, name: "Lua (5.3.5)" },
  { id: 67, name: "Perl (5.28.1)" },
  { id: 70, name: "Python (2.7.17)" },
  { id: 75, name: "TypeScript (3.7.4)" },
];

const CodeEval = () => {
  const [sourceCode, setSourceCode] = useState("");
  const [output, setOutput] = useState("");
  const [result, setResult] = useState("");
  const [language, setLanguage] = useState(languages[3]); // Default Python 3

  const handleRun = async () => {
    try {
      const response = await axios.post("http://localhost:5002/api/codeEval/run", {
        language_id: language.id,
        source_code: sourceCode,
      });

      const actualOutput = response.data.stdout?.trim() || "";
      setOutput(actualOutput);

      
    } catch (error) {
      setOutput("❌ Error running code");
      setResult("");
      console.error(error);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>⚙️ Judge0 Code Runner</h1>

      <label>Language:</label>
      <select
        value={language.id}
        onChange={(e) =>
          setLanguage(
            languages.find((lang) => lang.id === parseInt(e.target.value))
          )
        }
        style={{ marginLeft: 10 }}
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>

      <br />
      <br />

      <textarea
        rows="10"
        cols="80"
        placeholder="Type your code here..."
        value={sourceCode}
        onChange={(e) => setSourceCode(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Tab") {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const updated =
              sourceCode.substring(0, start) + "  " + sourceCode.substring(end);
            setSourceCode(updated);
            setTimeout(() => {
              e.target.selectionStart = e.target.selectionEnd = start + 2;
            }, 0);
          }
        }}
      />

      <br />
      

      <br />
      <button onClick={handleRun} style={{ marginTop: 10 }}>
        ▶️ Run Code
      </button>

      <h3>🖨️ Output:</h3>
      <pre>{output}</pre>

      
    </div>
  );
};

export default CodeEval;
