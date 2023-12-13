const api_key = "API_KEY";
const API_URL = "https://api.openai.com/v1/chat/completions";
const promptInput = document.getElementById("promptInputBox");
const generteBtn = document.getElementById("generate_btn");
const cancelBtn = document.getElementById("stopBtn");
const resultText = document.getElementById("resultText");

const generateFun = async () => {
  // If input field iss empty then press enter
  if (!promptInput.value) {
    alert("Please enter a prompt.");
    return;
  }
  generteBtn.disabled = true;
  resultText.innerText = "generating...";
  const question = promptInput.value;
  promptInput.value = "";
  try {
    //Simple response Get
    // const response = await fetch(API_URL, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: `Bearer ${api_key}`,
    //   },
    //   body: JSON.stringify({
    //     model: "gpt-3.5-turbo",
    //     messages: [{ role: "user", content: question }],
    //   }),
    // });

    // Streaming response get
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${api_key}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: question }],
        stream: true,
      }),
    });
    const reader = response.body.getReader();
    const decorder = new TextDecoder("utf-8");
    resultText.innerText = "";
    while (true) {
      const chunk = await reader.read();
      const { done, value } = chunk;
      if (done) {
        break;
      }
      const decodedChunk = decorder.decode(value);
      const lines = decodedChunk.split("\n");
      const parsedLines = lines
        .map((line) => line.replace(/^data: /, "").trim())
        .filter((line) => line !== "" && line !== "[DONE]")
        .map((line) => JSON.parse(line));

      for (const parsedLine of parsedLines) {
        const { choices } = parsedLine;
        const { delta } = choices[0];
        const { content } = delta;
        if (content) {
          resultText.innerText += content;
        }
      }
    }
  } catch (error) {
    resultText.innerText = "Error occurred while generating.";
    console.log(error);
  } finally {
    generteBtn.disabled = false;
  }
};

generteBtn.addEventListener("click", generateFun);
promptInput.addEventListener("keyup", (event) => {
  if (event.key == "Enter") {
    generateFun();
  }
});
