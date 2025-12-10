import { useState, useRef, useEffect } from "react";
import { MessageCircle, Send, AlertCircle, History, Plus, Trash2 } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // ✅ real Gemini SDK import

// ✅ Real Gemini client using your .env key
const realGenAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// ✅ Your existing mock kept as fallback (if no key is present)
const mockGenAI = {
  getGenerativeModel: () => ({
    generateContent: async (prompt) => {
      // Mock response for demo - analyzes actual user input
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Extract the last user message from the prompt
      const messages = prompt.split("User:").filter(Boolean);
      const lastUserMessage = messages[messages.length - 1]
        .split("Assistant:")[0]
        .trim()
        .toLowerCase();

      // Count conversation turns
      const conversationTurns = messages.length;

      // FIRST TURN - User describes initial problem
      if (conversationTurns === 1) {
        // Check what symptom they mentioned
        if (lastUserMessage.includes("headache")) {
          return {
            response: {
              text: () =>
                "I'm sorry you're dealing with a headache. To help you better, I need to understand more:\n\n1. How many days have you had this headache?\n2. On a scale of 1-10, how severe is the pain?\n3. Where exactly is the pain located (front, sides, back of head)?\n4. Do you have any other symptoms like nausea, sensitivity to light, or fever?",
            },
          };
        } else if (
          lastUserMessage.includes("stomach") ||
          lastUserMessage.includes("pain")
        ) {
          return {
            response: {
              text: () =>
                "I understand you're having stomach discomfort. Let me ask a few questions:\n\n1. How long have you been experiencing this?\n2. On a scale of 1-10, how would you rate the pain?\n3. Is the pain constant or does it come and go?\n4. Do you have any other symptoms like nausea, vomiting, diarrhea, or fever?",
            },
          };
        } else if (
          lastUserMessage.includes("chest pain") ||
          lastUserMessage.includes("breathless")
        ) {
          return {
            response: {
              text: () =>
                "I'm concerned about your symptoms. Let me ask some important questions:\n\n1. How long have you had this chest pain?\n2. On a scale of 1-10, how severe is it?\n3. Does the pain spread to your arm, jaw, or back?\n4. Do you have any history of heart problems or high blood pressure?",
            },
          };
        } else if (
          lastUserMessage.includes("anxious") ||
          lastUserMessage.includes("sleep")
        ) {
          return {
            response: {
              text: () =>
                "I hear that you're struggling with anxiety and sleep. Let me understand better:\n\n1. How long have you been experiencing these symptoms?\n2. On a scale of 1-10, how severe is your anxiety?\n3. Are you able to fall asleep, or do you wake up during the night?\n4. Have you experienced any major stress or life changes recently?",
            },
          };
        } else {
          return {
            response: {
              text: () =>
                "I'd like to help you with your symptoms. To better understand what you're going through:\n\n1. How long have you been experiencing this?\n2. On a scale of 1-10, how severe are your symptoms?\n3. Have you noticed anything that makes it better or worse?\n4. Do you have any other symptoms?",
            },
          };
        }
      }

      // SECOND TURN - User answers questions, AI provides guidance
      if (conversationTurns === 2) {
        // Parse their answers for severity and duration
        const hasSeverity = lastUserMessage.match(
          /(\d+)\/10|(\d+) out of 10|severity.*?(\d+)/
        );
        const hasDuration = lastUserMessage.match(/(\d+)\s*(day|hour|week)/);

        let guidance =
          "Thank you for sharing that information. Based on what you've told me:\n\n";

        // Check ENTIRE conversation history for original symptom
        const fullConversation = prompt.toLowerCase();

        if (fullConversation.includes("headache")) {
          guidance += "**Possible causes of your headache:**\n\n";
          guidance +=
            "1. **Tension headache** - Very common, especially with stress or long screen time. Usually feels like a tight band around the head.\n\n";
          guidance +=
            "2. **Migraine** - If you have sensitivity to light/sound or nausea, this could be a migraine.\n\n";
          guidance +=
            "3. **Eye strain** - If you spend a lot of time on screens without breaks.\n\n";
          guidance +=
            "4. **Dehydration** - Not drinking enough water can cause headaches.\n\n";

          if (
            hasSeverity &&
            parseInt(hasSeverity[1] || hasSeverity[2] || hasSeverity[3]) >= 7
          ) {
            guidance +=
              "**Next steps:** Given your pain level, I recommend seeing a doctor within 24-48 hours.\n\n";
          } else {
            guidance += "**Next steps:**\n";
            guidance += "- Try resting in a dark, quiet room\n";
            guidance += "- Stay well hydrated\n";
            guidance += "- Apply a cold compress to your forehead\n";
            guidance += "- Take breaks from screens every 20 minutes\n";
            guidance +=
              "- If it doesn't improve in 2-3 days, see your doctor\n\n";
          }

          guidance += "**See a doctor immediately if:**\n";
          guidance += "- Sudden severe headache (worst of your life)\n";
          guidance += "- Headache with fever, stiff neck, confusion\n";
          guidance += "- Vision changes or difficulty speaking\n\n";
        } else if (
          fullConversation.includes("stomach") ||
          fullConversation.includes("pain")
        ) {
          guidance += "**Possible causes:**\n\n";
          guidance +=
            "1. **Gastritis or indigestion** - Often related to diet, stress, or eating habits.\n\n";
          guidance +=
            "2. **Food intolerance** - Lactose, gluten, or other food sensitivities.\n\n";
          guidance +=
            "3. **Gastroenteritis** - If you also have diarrhea, could be a stomach bug.\n\n";
          guidance +=
            "4. **Acid reflux** - Burning sensation, worse after eating.\n\n";

          guidance += "**Next steps:**\n";
          guidance += "- Eat bland foods (rice, bananas, toast)\n";
          guidance += "- Avoid spicy, fatty, or acidic foods\n";
          guidance += "- Stay hydrated with small sips of water\n";
          guidance +=
            "- If symptoms persist beyond 2-3 days, see your doctor\n\n";
        } else if (
          fullConversation.includes("anxious") ||
          fullConversation.includes("sleep")
        ) {
          guidance += "**What might be happening:**\n\n";
          guidance +=
            "1. **Anxiety disorder** - Persistent worry that affects daily life and sleep.\n\n";
          guidance +=
            "2. **Stress response** - Your body reacting to recent stressors.\n\n";
          guidance +=
            "3. **Sleep disorder** - Insomnia or disrupted sleep patterns.\n\n";

          guidance += "**Next steps:**\n";
          guidance +=
            "- Practice relaxation techniques (deep breathing, meditation)\n";
          guidance += "- Maintain a regular sleep schedule\n";
          guidance +=
            "- Limit caffeine and screen time before bed\n";
          guidance +=
            "- Consider speaking with a mental health professional\n\n";
        } else {
          guidance += "**General recommendations:**\n\n";
          guidance +=
            "Based on your symptoms, here are some general suggestions:\n";
          guidance +=
            "- Monitor your symptoms over the next 24-48 hours\n";
          guidance += "- Stay well hydrated and get adequate rest\n";
          guidance += "- Note any changes or new symptoms\n";
          guidance +=
            "- If symptoms worsen, seek medical attention\n\n";
        }

        guidance += "**Questions to ask your doctor:**\n";
        guidance += "- What tests might help identify the cause?\n";
        guidance += "- What warning signs should I watch for?\n";
        guidance += "- Are there any lifestyle changes that could help?";

        return {
          response: {
            text: () => guidance,
          },
        };
      }

      // THIRD+ TURNS - Continue conversation naturally
      if (
        lastUserMessage.includes("worried") ||
        lastUserMessage.includes("concern")
      ) {
        return {
          response: {
            text: () =>
              "It's completely natural to feel concerned about your health. Based on what you've described, your symptoms don't appear to be immediately dangerous, but they do warrant attention.\n\nIf you're feeling particularly worried or if your symptoms change or worsen, don't hesitate to contact a healthcare provider. It's always better to get checked out for peace of mind.\n\nIs there anything specific that's making you especially worried?",
          },
        };
      } else if (
        lastUserMessage.includes("thank") ||
        lastUserMessage.includes("thanks")
      ) {
        return {
          response: {
            text: () =>
              "You're very welcome! I hope you feel better soon. Remember to follow the guidance I provided, and don't hesitate to seek medical care if your symptoms worsen or if you have any concerns.\n\nTake care of yourself! 💙",
          },
        };
      } else if (
        lastUserMessage.includes("doctor") ||
        lastUserMessage.includes("see")
      ) {
        return {
          response: {
            text: () =>
              "Yes, seeing a doctor is a good idea if:\n- Your symptoms aren't improving after a few days\n- They're getting worse\n- You're developing new symptoms\n- You're feeling very concerned\n\nWhen you visit, make sure to mention all the symptoms we discussed and how long you've had them. This will help your doctor make a proper assessment.",
          },
        };
      } else {
        return {
          response: {
            text: () =>
              "I understand. Is there anything else about your symptoms you'd like to discuss? I'm here to help answer any questions you might have about what you're experiencing or the guidance I provided.",
          },
        };
      }
    },
  }),
};

// ✅ Choose real API if key exists, otherwise use mock
const genAI =
  import.meta.env.VITE_GEMINI_API_KEY && import.meta.env.VITE_GEMINI_API_KEY !== ""
    ? realGenAI
    : mockGenAI;

const DISCLAIMER =
  "⚠️ I am an AI assistant, not a doctor. I may be wrong. For medical advice, diagnosis, or treatment, please consult a qualified healthcare professional. If this feels like an emergency, contact local emergency services immediately.";

function isEmergency(text) {
  if (!text) return false;
  const t = text.toLowerCase();

  if (
    t.includes("chest pain") &&
    (t.includes("shortness of breath") ||
      t.includes("breathless") ||
      t.includes("can't breathe") ||
      t.includes("cannot breathe") ||
      t.includes("hard to breathe") ||
      t.includes("left arm") ||
      t.includes("jaw"))
  ) {
    return true;
  }

  if (
    t.includes("one side weak") ||
    t.includes("weakness on one side") ||
    t.includes("face drooping") ||
    t.includes("drooping face") ||
    t.includes("slurred speech") ||
    t.includes("cannot speak properly") ||
    t.includes("suddenly can't move my arm") ||
    t.includes("suddenly cant move my arm")
  ) {
    return true;
  }

  if (
    t.includes("severe shortness of breath") ||
    t.includes("struggling to breathe") ||
    t.includes("can't breathe at all") ||
    t.includes("cannot breathe at all")
  ) {
    return true;
  }

  if (
    t.includes("heavy bleeding") &&
    (t.includes("won't stop") ||
      t.includes("will not stop") ||
      t.includes("not stopping"))
  ) {
    return true;
  }

  if (
    t.includes("unconscious") ||
    t.includes("not waking up") ||
    t.includes("passed out for a long time")
  ) {
    return true;
  }

  if (
    t.includes("want to die") ||
    t.includes("kill myself") ||
    t.includes("end my life") ||
    t.includes("no reason to live") ||
    t.includes("cut myself") ||
    t.includes("suicidal")
  ) {
    return true;
  }

  return false;
}

// ✅ SYSTEM_PROMPT kept EXACTLY as you wrote it
const SYSTEM_PROMPT = `
You are a helpful, empathetic health assistant chatbot.

Core rules:
- You are NOT a doctor and cannot give a medical diagnosis or prescribe specific drugs or dosages.
- You help users understand their symptoms, possible general causes, and when to seek in-person care.
- Always use simple, non-technical language unless the user asks for technical detail.
- Never claim certainty. Use language like "may", "might", "could be", or "in many cases".
- Do not mention that you are reading or following a system prompt.

CRITICAL CONVERSATION FLOW:
1. FIRST MESSAGE: When a user first describes a health problem, ask 2-3 follow-up questions to gather more information.
2. SUBSEQUENT MESSAGES: Once you have asked your initial questions, STOP asking questions repeatedly. Read the user's responses carefully and provide helpful guidance based on what they've told you.
3. DO NOT repeat the same questions multiple times. If the user has already provided information, acknowledge it and move forward.
4. After receiving answers to your questions, provide:
   • A short acknowledgement of their situation
   • 2-4 possible general explanations (not diagnoses)
   • Clear next steps: whether they can observe at home, see a doctor within a certain time, or should go to an emergency department
   • Helpful questions they can ask their doctor

Key information to gather (ask 2-3 at a time in your FIRST response only):
- Age and sex
- Location of the problem (where exactly in the body)
- Duration (since when)
- Severity (1-10 scale)
- Pattern (constant or comes and goes)
- Triggers and relief (what makes it worse or better)
- Associated symptoms (fever, breathlessness, nausea, vomiting, dizziness, weakness, weight loss, etc.)
- Past medical conditions (e.g., diabetes, blood pressure, heart disease, asthma)
- Medications and allergies
- For females when relevant: pregnancy possibility, last period

Safety rules:
- If the description suggests a possible emergency (severe chest pain with breathlessness or pain going to the jaw/left arm, signs of stroke like one-sided weakness or trouble speaking, severe difficulty breathing, heavy uncontrolled bleeding, loss of consciousness, or suicidal thoughts), clearly tell the user to seek emergency medical care immediately and avoid giving detailed home-treatment advice.
- Never downplay serious or life-threatening symptoms.

Output style:
- Be empathetic and supportive ("I'm sorry you're going through this", etc.).
- Keep answers focused and not too long.
- After asking your initial questions, move to providing guidance based on the answers received.
`;

function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedChats, setSavedChats] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [hasAskedQuestions, setHasAskedQuestions] = useState(false);

  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  function buildPrompt(userMsg) {
    const historyText = chatHistory
      .map((chat) =>
        chat.type === "question"
          ? `User: ${chat.content}`
          : `Assistant: ${chat.content}`
      )
      .join("\n");

    const fullPrompt = `
${SYSTEM_PROMPT}

Conversation so far:
${historyText}

User: ${userMsg}
Assistant:
    `.trim();

    return fullPrompt;
  }

  async function generateAnswer(e) {
    if (e) e.preventDefault();
    if (!question.trim() || loading) return;

    const userMsg = question.trim();
    setQuestion("");
    setLoading(true);

    setChatHistory((prev) => [...prev, { type: "question", content: userMsg }]);

    if (isEmergency(userMsg)) {
      const emergencyReply =
        "⚠️ Your description contains signs that could mean a serious or emergency situation.\n\n" +
        "I strongly recommend that you **do not rely on this chat** right now. Please seek immediate medical attention or contact your local emergency number / nearest hospital.\n\n" +
        DISCLAIMER;

      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: emergencyReply },
      ]);
      setLoading(false);
      return;
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
      });

      const prompt = buildPrompt(userMsg);
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      const finalAnswer = `${text.trim()}\n\n${DISCLAIMER}`;

      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: finalAnswer },
      ]);

      setHasAskedQuestions(true);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        {
          type: "answer",
          content:
            "Error while contacting the AI service: " +
            (error?.message || "Unknown error"),
        },
      ]);
    }

    setLoading(false);
  }

  const handleBack = () => {
    if (loading || chatHistory.length === 0) return;

    const lastQuestionIndex = [...chatHistory]
      .map((m, i) => (m.type === "question" ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    if (lastQuestionIndex === undefined) return;

    const lastQuestion = chatHistory[lastQuestionIndex].content;
    const newHistory = chatHistory.slice(0, lastQuestionIndex);

    setChatHistory(newHistory);
    setQuestion(lastQuestion);
  };

  const startNewChat = () => {
    if (chatHistory.length > 0) {
      const chatTitle =
        chatHistory[0]?.content.slice(0, 50) + "..." || "New Chat";
      const timestamp = new Date().toLocaleString();
      setSavedChats((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: chatTitle,
          timestamp,
          messages: chatHistory,
        },
      ]);
    }
    setChatHistory([]);
    setQuestion("");
    setHasAskedQuestions(false);
  };

  const loadChat = (chat) => {
    if (chatHistory.length > 0) {
      const chatTitle =
        chatHistory[0]?.content.slice(0, 50) + "..." || "New Chat";
      const timestamp = new Date().toLocaleString();
      setSavedChats((prev) => [
        ...prev,
        {
          id: Date.now(),
          title: chatTitle,
          timestamp,
          messages: chatHistory,
        },
      ]);
    }
    setChatHistory(chat.messages);
    setShowHistory(false);
    setHasAskedQuestions(true);
  };

  const deleteChat = (chatId) => {
    setSavedChats((prev) => prev.filter((chat) => chat.id !== chatId));
  };

  const quickPrompts = [
    "I have chest pain and feel a bit breathless.",
    "I have had a headache for the last 3 days.",
    "I have stomach pain and loose motions.",
    "I feel very anxious and can't sleep properly.",
  ];

  const handleQuickPromptClick = (text) => {
    setQuestion(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateAnswer();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="h-screen max-w-5xl mx-auto flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-xl shadow-lg">
                  <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Health Chat AI
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                    Describe your symptoms. I&apos;ll ask questions and guide
                    you.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
                >
                  <History className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline text-sm font-medium">
                    History
                  </span>
                </button>
                {chatHistory.length > 0 && (
                  <button
                    onClick={startNewChat}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="hidden sm:inline text-sm font-medium">
                      New
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4 relative">
          {/* History Sidebar */}
          {showHistory && (
            <div className="absolute left-4 top-4 bottom-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-10 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <History className="w-5 h-5" />
                  Chat History
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {savedChats.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No saved chats yet
                  </p>
                ) : (
                  savedChats.map((chat) => (
                    <div
                      key={chat.id}
                      className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer border border-gray-200 group"
                    >
                      <div onClick={() => loadChat(chat)}>
                        <p className="text-sm font-medium text-gray-800 truncate mb-1">
                          {chat.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {chat.timestamp}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteChat(chat.id);
                        }}
                        className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          <div
            ref={chatRef}
            className="h-full overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200 p-4 sm:p-6 space-y-4"
          >
            {chatHistory.map((chat, index) => (
              <div
                key={index}
                className={`flex ${
                  chat.type === "question"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                    chat.type === "question"
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                      : "bg-gray-50 text-gray-800 border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
                    {chat.content}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">Thinking</span>
                  </div>
                </div>
              </div>
            )}

            {chatHistory.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
                  <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center px-4">
                  How can I help you today?
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 text-center px-4">
                  Start by describing what you're feeling
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl px-4">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="text-xs sm:text-sm px-4 py-3 rounded-xl border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-left text-gray-700 font-medium shadow-sm hover:shadow-md"
                      onClick={() => handleQuickPromptClick(qp)}
                    >
                      {qp}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
            {/* Disclaimer */}
            <div className="flex items-start gap-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] sm:text-xs text-amber-800 leading-relaxed">
                This chat is for general information only and is not a substitute
                for professional medical advice, diagnosis, or treatment. For
                emergencies, contact local medical services.
              </p>
            </div>

            {/* Input Container */}
            <div className="space-y-3">
              <textarea
                required
                className="w-full border-2 border-gray-300 rounded-xl p-3 sm:p-4 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Describe your symptom or health question in detail..."
                rows="3"
              ></textarea>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={generateAnswer}
                  disabled={loading || !question.trim()}
                  className={`flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md hover:shadow-lg ${
                    loading || !question.trim()
                      ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {hasAskedQuestions ? "Send Answer" : "Send Message"}
                      </span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;



// import { useState, useRef, useEffect } from "react";
// import { MessageCircle, Send, AlertCircle, History, Plus, Trash2 } from "lucide-react";

// const genAI = {
//   getGenerativeModel: () => ({
//     generateContent: async (prompt) => {
//       // Mock response for demo - analyzes actual user input
//       await new Promise(resolve => setTimeout(resolve, 1500));
      
//       // Extract the last user message from the prompt
//       const messages = prompt.split('User:').filter(Boolean);
//       const lastUserMessage = messages[messages.length - 1].split('Assistant:')[0].trim().toLowerCase();
      
//       // Count conversation turns
//       const conversationTurns = messages.length;
      
//       // FIRST TURN - User describes initial problem
//       if (conversationTurns === 1) {
//         // Check what symptom they mentioned
//         if (lastUserMessage.includes('headache')) {
//           return {
//             response: {
//               text: () => "I'm sorry you're dealing with a headache. To help you better, I need to understand more:\n\n1. How many days have you had this headache?\n2. On a scale of 1-10, how severe is the pain?\n3. Where exactly is the pain located (front, sides, back of head)?\n4. Do you have any other symptoms like nausea, sensitivity to light, or fever?"
//             }
//           };
//         } else if (lastUserMessage.includes('stomach') || lastUserMessage.includes('pain')) {
//           return {
//             response: {
//               text: () => "I understand you're having stomach discomfort. Let me ask a few questions:\n\n1. How long have you been experiencing this?\n2. On a scale of 1-10, how would you rate the pain?\n3. Is the pain constant or does it come and go?\n4. Do you have any other symptoms like nausea, vomiting, diarrhea, or fever?"
//             }
//           };
//         } else if (lastUserMessage.includes('chest pain') || lastUserMessage.includes('breathless')) {
//           return {
//             response: {
//               text: () => "I'm concerned about your symptoms. Let me ask some important questions:\n\n1. How long have you had this chest pain?\n2. On a scale of 1-10, how severe is it?\n3. Does the pain spread to your arm, jaw, or back?\n4. Do you have any history of heart problems or high blood pressure?"
//             }
//           };
//         } else if (lastUserMessage.includes('anxious') || lastUserMessage.includes('sleep')) {
//           return {
//             response: {
//               text: () => "I hear that you're struggling with anxiety and sleep. Let me understand better:\n\n1. How long have you been experiencing these symptoms?\n2. On a scale of 1-10, how severe is your anxiety?\n3. Are you able to fall asleep, or do you wake up during the night?\n4. Have you experienced any major stress or life changes recently?"
//             }
//           };
//         } else {
//           return {
//             response: {
//               text: () => "I'd like to help you with your symptoms. To better understand what you're going through:\n\n1. How long have you been experiencing this?\n2. On a scale of 1-10, how severe are your symptoms?\n3. Have you noticed anything that makes it better or worse?\n4. Do you have any other symptoms?"
//             }
//           };
//         }
//       }
      
//       // SECOND TURN - User answers questions, AI provides guidance
//       if (conversationTurns === 2) {
//         // Parse their answers for severity and duration
//         const hasSeverity = lastUserMessage.match(/(\d+)\/10|(\d+) out of 10|severity.*?(\d+)/);
//         const hasDuration = lastUserMessage.match(/(\d+)\s*(day|hour|week)/);
        
//         let guidance = "Thank you for sharing that information. Based on what you've told me:\n\n";
        
//         // Check ENTIRE conversation history for original symptom
//         const fullConversation = prompt.toLowerCase();
        
//         if (fullConversation.includes('headache')) {
//           guidance += "**Possible causes of your headache:**\n\n";
//           guidance += "1. **Tension headache** - Very common, especially with stress or long screen time. Usually feels like a tight band around the head.\n\n";
//           guidance += "2. **Migraine** - If you have sensitivity to light/sound or nausea, this could be a migraine.\n\n";
//           guidance += "3. **Eye strain** - If you spend a lot of time on screens without breaks.\n\n";
//           guidance += "4. **Dehydration** - Not drinking enough water can cause headaches.\n\n";
          
//           if (hasSeverity && parseInt(hasSeverity[1] || hasSeverity[2] || hasSeverity[3]) >= 7) {
//             guidance += "**Next steps:** Given your pain level, I recommend seeing a doctor within 24-48 hours.\n\n";
//           } else {
//             guidance += "**Next steps:**\n";
//             guidance += "- Try resting in a dark, quiet room\n";
//             guidance += "- Stay well hydrated\n";
//             guidance += "- Apply a cold compress to your forehead\n";
//             guidance += "- Take breaks from screens every 20 minutes\n";
//             guidance += "- If it doesn't improve in 2-3 days, see your doctor\n\n";
//           }
          
//           guidance += "**See a doctor immediately if:**\n";
//           guidance += "- Sudden severe headache (worst of your life)\n";
//           guidance += "- Headache with fever, stiff neck, confusion\n";
//           guidance += "- Vision changes or difficulty speaking\n\n";
          
//         } else if (fullConversation.includes('stomach') || fullConversation.includes('pain')) {
//           guidance += "**Possible causes:**\n\n";
//           guidance += "1. **Gastritis or indigestion** - Often related to diet, stress, or eating habits.\n\n";
//           guidance += "2. **Food intolerance** - Lactose, gluten, or other food sensitivities.\n\n";
//           guidance += "3. **Gastroenteritis** - If you also have diarrhea, could be a stomach bug.\n\n";
//           guidance += "4. **Acid reflux** - Burning sensation, worse after eating.\n\n";
          
//           guidance += "**Next steps:**\n";
//           guidance += "- Eat bland foods (rice, bananas, toast)\n";
//           guidance += "- Avoid spicy, fatty, or acidic foods\n";
//           guidance += "- Stay hydrated with small sips of water\n";
//           guidance += "- If symptoms persist beyond 2-3 days, see your doctor\n\n";
          
//         } else if (fullConversation.includes('anxious') || fullConversation.includes('sleep')) {
//           guidance += "**What might be happening:**\n\n";
//           guidance += "1. **Anxiety disorder** - Persistent worry that affects daily life and sleep.\n\n";
//           guidance += "2. **Stress response** - Your body reacting to recent stressors.\n\n";
//           guidance += "3. **Sleep disorder** - Insomnia or disrupted sleep patterns.\n\n";
          
//           guidance += "**Next steps:**\n";
//           guidance += "- Practice relaxation techniques (deep breathing, meditation)\n";
//           guidance += "- Maintain a regular sleep schedule\n";
//           guidance += "- Limit caffeine and screen time before bed\n";
//           guidance += "- Consider speaking with a mental health professional\n\n";
          
//         } else {
//           guidance += "**General recommendations:**\n\n";
//           guidance += "Based on your symptoms, here are some general suggestions:\n";
//           guidance += "- Monitor your symptoms over the next 24-48 hours\n";
//           guidance += "- Stay well hydrated and get adequate rest\n";
//           guidance += "- Note any changes or new symptoms\n";
//           guidance += "- If symptoms worsen, seek medical attention\n\n";
//         }
        
//         guidance += "**Questions to ask your doctor:**\n";
//         guidance += "- What tests might help identify the cause?\n";
//         guidance += "- What warning signs should I watch for?\n";
//         guidance += "- Are there any lifestyle changes that could help?";
        
//         return {
//           response: {
//             text: () => guidance
//           }
//         };
//       }
      
//       // THIRD+ TURNS - Continue conversation naturally
//       if (lastUserMessage.includes('worried') || lastUserMessage.includes('concern')) {
//         return {
//           response: {
//             text: () => "It's completely natural to feel concerned about your health. Based on what you've described, your symptoms don't appear to be immediately dangerous, but they do warrant attention.\n\nIf you're feeling particularly worried or if your symptoms change or worsen, don't hesitate to contact a healthcare provider. It's always better to get checked out for peace of mind.\n\nIs there anything specific that's making you especially worried?"
//           }
//         };
//       } else if (lastUserMessage.includes('thank') || lastUserMessage.includes('thanks')) {
//         return {
//           response: {
//             text: () => "You're very welcome! I hope you feel better soon. Remember to follow the guidance I provided, and don't hesitate to seek medical care if your symptoms worsen or if you have any concerns.\n\nTake care of yourself! 💙"
//           }
//         };
//       } else if (lastUserMessage.includes('doctor') || lastUserMessage.includes('see')) {
//         return {
//           response: {
//             text: () => "Yes, seeing a doctor is a good idea if:\n- Your symptoms aren't improving after a few days\n- They're getting worse\n- You're developing new symptoms\n- You're feeling very concerned\n\nWhen you visit, make sure to mention all the symptoms we discussed and how long you've had them. This will help your doctor make a proper assessment."
//           }
//         };
//       } else {
//         return {
//           response: {
//             text: () => "I understand. Is there anything else about your symptoms you'd like to discuss? I'm here to help answer any questions you might have about what you're experiencing or the guidance I provided."
//           }
//         };
//       }
//     }
//   })
// };

// const DISCLAIMER =
//   "⚠️ I am an AI assistant, not a doctor. I may be wrong. For medical advice, diagnosis, or treatment, please consult a qualified healthcare professional. If this feels like an emergency, contact local emergency services immediately.";

// function isEmergency(text) {
//   if (!text) return false;
//   const t = text.toLowerCase();

//   if (
//     t.includes("chest pain") &&
//     (t.includes("shortness of breath") ||
//       t.includes("breathless") ||
//       t.includes("can't breathe") ||
//       t.includes("cannot breathe") ||
//       t.includes("hard to breathe") ||
//       t.includes("left arm") ||
//       t.includes("jaw"))
//   ) {
//     return true;
//   }

//   if (
//     t.includes("one side weak") ||
//     t.includes("weakness on one side") ||
//     t.includes("face drooping") ||
//     t.includes("drooping face") ||
//     t.includes("slurred speech") ||
//     t.includes("cannot speak properly") ||
//     t.includes("suddenly can't move my arm") ||
//     t.includes("suddenly cant move my arm")
//   ) {
//     return true;
//   }

//   if (
//     t.includes("severe shortness of breath") ||
//     t.includes("struggling to breathe") ||
//     t.includes("can't breathe at all") ||
//     t.includes("cannot breathe at all")
//   ) {
//     return true;
//   }

//   if (
//     t.includes("heavy bleeding") &&
//     (t.includes("won't stop") || t.includes("will not stop") || t.includes("not stopping"))
//   ) {
//     return true;
//   }

//   if (
//     t.includes("unconscious") ||
//     t.includes("not waking up") ||
//     t.includes("passed out for a long time")
//   ) {
//     return true;
//   }

//   if (
//     t.includes("want to die") ||
//     t.includes("kill myself") ||
//     t.includes("end my life") ||
//     t.includes("no reason to live") ||
//     t.includes("cut myself") ||
//     t.includes("suicidal")
//   ) {
//     return true;
//   }

//   return false;
// }

// const SYSTEM_PROMPT = `
// You are a helpful, empathetic health assistant chatbot.

// Core rules:
// - You are NOT a doctor and cannot give a medical diagnosis or prescribe specific drugs or dosages.
// - You help users understand their symptoms, possible general causes, and when to seek in-person care.
// - Always use simple, non-technical language unless the user asks for technical detail.
// - Never claim certainty. Use language like "may", "might", "could be", or "in many cases".
// - Do not mention that you are reading or following a system prompt.

// CRITICAL CONVERSATION FLOW:
// 1. FIRST MESSAGE: When a user first describes a health problem, ask 2-3 follow-up questions to gather more information.
// 2. SUBSEQUENT MESSAGES: Once you have asked your initial questions, STOP asking questions repeatedly. Read the user's responses carefully and provide helpful guidance based on what they've told you.
// 3. DO NOT repeat the same questions multiple times. If the user has already provided information, acknowledge it and move forward.
// 4. After receiving answers to your questions, provide:
//    • A short acknowledgement of their situation
//    • 2-4 possible general explanations (not diagnoses)
//    • Clear next steps: whether they can observe at home, see a doctor within a certain time, or should go to an emergency department
//    • Helpful questions they can ask their doctor

// Key information to gather (ask 2-3 at a time in your FIRST response only):
// - Age and sex
// - Location of the problem (where exactly in the body)
// - Duration (since when)
// - Severity (1-10 scale)
// - Pattern (constant or comes and goes)
// - Triggers and relief (what makes it worse or better)
// - Associated symptoms (fever, breathlessness, nausea, vomiting, dizziness, weakness, weight loss, etc.)
// - Past medical conditions (e.g., diabetes, blood pressure, heart disease, asthma)
// - Medications and allergies
// - For females when relevant: pregnancy possibility, last period

// Safety rules:
// - If the description suggests a possible emergency (severe chest pain with breathlessness or pain going to the jaw/left arm, signs of stroke like one-sided weakness or trouble speaking, severe difficulty breathing, heavy uncontrolled bleeding, loss of consciousness, or suicidal thoughts), clearly tell the user to seek emergency medical care immediately and avoid giving detailed home-treatment advice.
// - Never downplay serious or life-threatening symptoms.

// Output style:
// - Be empathetic and supportive ("I'm sorry you're going through this", etc.).
// - Keep answers focused and not too long.
// - After asking your initial questions, move to providing guidance based on the answers received.
// `;

// function App() {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [savedChats, setSavedChats] = useState([]);
//   const [showHistory, setShowHistory] = useState(false);
//   const [hasAskedQuestions, setHasAskedQuestions] = useState(false);

//   const chatRef = useRef(null);

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [chatHistory, loading]);

//   function buildPrompt(userMsg) {
//     const historyText = chatHistory
//       .map((chat) =>
//         chat.type === "question"
//           ? `User: ${chat.content}`
//           : `Assistant: ${chat.content}`
//       )
//       .join("\n");

//     const fullPrompt = `
// ${SYSTEM_PROMPT}

// Conversation so far:
// ${historyText}

// User: ${userMsg}
// Assistant:
//     `.trim();

//     return fullPrompt;
//   }

//   async function generateAnswer(e) {
//     if (e) e.preventDefault();
//     if (!question.trim() || loading) return;

//     const userMsg = question.trim();
//     setQuestion("");
//     setLoading(true);

//     setChatHistory((prev) => [...prev, { type: "question", content: userMsg }]);

//     if (isEmergency(userMsg)) {
//       const emergencyReply =
//         "⚠️ Your description contains signs that could mean a serious or emergency situation.\n\n" +
//         "I strongly recommend that you **do not rely on this chat** right now. Please seek immediate medical attention or contact your local emergency number / nearest hospital.\n\n" +
//         DISCLAIMER;

//       setChatHistory((prev) => [
//         ...prev,
//         { type: "answer", content: emergencyReply },
//       ]);
//       setLoading(false);
//       return;
//     }

//     try {
//       const model = genAI.getGenerativeModel({
//         model: "gemini-2.5-flash",
//       });

//       const prompt = buildPrompt(userMsg);

//       const result = await model.generateContent(prompt);
//       const text = result.response.text();

//       const finalAnswer = `${text.trim()}\n\n${DISCLAIMER}`;

//       setChatHistory((prev) => [
//         ...prev,
//         { type: "answer", content: finalAnswer },
//       ]);
      
//       // Mark that assistant has asked questions
//       setHasAskedQuestions(true);
//     } catch (error) {
//       console.error(error);
//       setChatHistory((prev) => [
//         ...prev,
//         {
//           type: "answer",
//           content:
//             "Error while contacting the AI service: " +
//             (error?.message || "Unknown error"),
//         },
//       ]);
//     }

//     setLoading(false);
//   }

//   const handleBack = () => {
//     if (loading || chatHistory.length === 0) return;

//     const lastQuestionIndex = [...chatHistory]
//       .map((m, i) => (m.type === "question" ? i : -1))
//       .filter((i) => i !== -1)
//       .pop();

//     if (lastQuestionIndex === undefined) return;

//     const lastQuestion = chatHistory[lastQuestionIndex].content;
//     const newHistory = chatHistory.slice(0, lastQuestionIndex);

//     setChatHistory(newHistory);
//     setQuestion(lastQuestion);
//   };

//   const startNewChat = () => {
//     if (chatHistory.length > 0) {
//       // Save current chat with timestamp
//       const chatTitle = chatHistory[0]?.content.slice(0, 50) + "..." || "New Chat";
//       const timestamp = new Date().toLocaleString();
//       setSavedChats(prev => [...prev, { 
//         id: Date.now(), 
//         title: chatTitle, 
//         timestamp,
//         messages: chatHistory 
//       }]);
//     }
//     setChatHistory([]);
//     setQuestion("");
//     setHasAskedQuestions(false);
//   };

//   const loadChat = (chat) => {
//     if (chatHistory.length > 0) {
//       const chatTitle = chatHistory[0]?.content.slice(0, 50) + "..." || "New Chat";
//       const timestamp = new Date().toLocaleString();
//       setSavedChats(prev => [...prev, { 
//         id: Date.now(), 
//         title: chatTitle, 
//         timestamp,
//         messages: chatHistory 
//       }]);
//     }
//     setChatHistory(chat.messages);
//     setShowHistory(false);
//     setHasAskedQuestions(true);
//   };

//   const deleteChat = (chatId) => {
//     setSavedChats(prev => prev.filter(chat => chat.id !== chatId));
//   };

//   const quickPrompts = [
//     "I have chest pain and feel a bit breathless.",
//     "I have had a headache for the last 3 days.",
//     "I have stomach pain and loose motions.",
//     "I feel very anxious and can't sleep properly.",
//   ];

//   const handleQuickPromptClick = (text) => {
//     setQuestion(text);
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       generateAnswer();
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
//       <div className="h-screen max-w-5xl mx-auto flex flex-col">
//         {/* Header */}
//         <header className="bg-white border-b border-gray-200 shadow-sm">
//           <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-3">
//                 <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 sm:p-3 rounded-xl shadow-lg">
//                   <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
//                     Health Chat AI
//                   </h1>
//                   <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
//                     Describe your symptoms. I'll ask questions and guide you.
//                   </p>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => setShowHistory(!showHistory)}
//                   className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-all"
//                 >
//                   <History className="w-4 h-4 sm:w-5 sm:h-5" />
//                   <span className="hidden sm:inline text-sm font-medium">History</span>
//                 </button>
//                 {chatHistory.length > 0 && (
//                   <button
//                     onClick={startNewChat}
//                     className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-all"
//                   >
//                     <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
//                     <span className="hidden sm:inline text-sm font-medium">New</span>
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </header>

//         {/* Chat Area */}
//         <div className="flex-1 overflow-hidden px-4 sm:px-6 py-4 relative">
//           {/* History Sidebar */}
//           {showHistory && (
//             <div className="absolute left-4 top-4 bottom-4 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 z-10 overflow-hidden flex flex-col">
//               <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
//                 <h3 className="font-semibold text-gray-800 flex items-center gap-2">
//                   <History className="w-5 h-5" />
//                   Chat History
//                 </h3>
//               </div>
//               <div className="flex-1 overflow-y-auto p-3 space-y-2">
//                 {savedChats.length === 0 ? (
//                   <p className="text-sm text-gray-500 text-center py-8">No saved chats yet</p>
//                 ) : (
//                   savedChats.map(chat => (
//                     <div
//                       key={chat.id}
//                       className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer border border-gray-200 group"
//                     >
//                       <div onClick={() => loadChat(chat)}>
//                         <p className="text-sm font-medium text-gray-800 truncate mb-1">
//                           {chat.title}
//                         </p>
//                         <p className="text-xs text-gray-500">{chat.timestamp}</p>
//                       </div>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           deleteChat(chat.id);
//                         }}
//                         className="mt-2 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
//                       >
//                         <Trash2 className="w-3 h-3" />
//                         Delete
//                       </button>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>
//           )}

//           <div
//             ref={chatRef}
//             className="h-full overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200 p-4 sm:p-6 space-y-4"
//           >
//             {chatHistory.map((chat, index) => (
//               <div
//                 key={index}
//                 className={`flex ${
//                   chat.type === "question" ? "justify-end" : "justify-start"
//                 }`}
//               >
//                 <div
//                   className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
//                     chat.type === "question"
//                       ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-tr-sm"
//                       : "bg-gray-50 text-gray-800 border border-gray-200 rounded-tl-sm"
//                   }`}
//                 >
//                   <div className="text-sm sm:text-base whitespace-pre-wrap break-words">
//                     {chat.content}
//                   </div>
//                 </div>
//               </div>
//             ))}

//             {loading && (
//               <div className="flex justify-start">
//                 <div className="bg-gray-50 border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-md">
//                   <div className="flex items-center gap-2">
//                     <div className="flex gap-1">
//                       <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
//                       <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
//                       <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
//                     </div>
//                     <span className="text-sm text-gray-600">Thinking</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {chatHistory.length === 0 && !loading && (
//               <div className="flex flex-col items-center justify-center h-full py-8 sm:py-12">
//                 <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 sm:p-6 rounded-full mb-4 sm:mb-6">
//                   <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600" />
//                 </div>
//                 <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 text-center px-4">
//                   How can I help you today?
//                 </h2>
//                 <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6 text-center px-4">
//                   Start by describing what you're feeling
//                 </p>
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 w-full max-w-2xl px-4">
//                   {quickPrompts.map((qp, idx) => (
//                     <button
//                       key={idx}
//                       type="button"
//                       className="text-xs sm:text-sm px-4 py-3 rounded-xl border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-left text-gray-700 font-medium shadow-sm hover:shadow-md"
//                       onClick={() => handleQuickPromptClick(qp)}
//                     >
//                       {qp}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Input Area */}
//         <div className="bg-white border-t border-gray-200 shadow-lg">
//           <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
//             {/* Disclaimer */}
//             <div className="flex items-start gap-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
//               <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
//               <p className="text-[10px] sm:text-xs text-amber-800 leading-relaxed">
//                 This chat is for general information only and is not a substitute for
//                 professional medical advice, diagnosis, or treatment. For emergencies,
//                 contact local medical services.
//               </p>
//             </div>

//             {/* Input Container */}
//             <div className="space-y-3">
//               <textarea
//                 required
//                 className="w-full border-2 border-gray-300 rounded-xl p-3 sm:p-4 text-sm sm:text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                 value={question}
//                 onChange={(e) => setQuestion(e.target.value)}
//                 onKeyDown={handleKeyDown}
//                 placeholder="Describe your symptom or health question in detail..."
//                 rows="3"
//               ></textarea>

//               <div className="flex items-center gap-2 sm:gap-3">
//                 <button
//                   type="button"
//                   onClick={generateAnswer}
//                   disabled={loading || !question.trim()}
//                   className={`flex-1 flex items-center justify-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md hover:shadow-lg ${
//                     loading || !question.trim()
//                       ? "bg-gradient-to-r from-blue-400 to-indigo-400 text-white cursor-not-allowed"
//                       : "bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
//                   }`}
//                 >
//                   {loading ? (
//                     <>
//                       <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                       <span>Sending...</span>
//                     </>
//                   ) : (
//                     <>
//                       <span>{hasAskedQuestions ? "Send Answer" : "Send Message"}</span>
//                       <Send className="w-4 h-4" />
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;

// import { useState, useRef, useEffect } from "react";
// import "./App.css";
// import ReactMarkdown from "react-markdown";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(
//   import.meta.env.VITE_GEMINI_API_KEY
// );

// function App() {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [loading, setLoading] = useState(false);

//   const chatRef = useRef(null);

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [chatHistory, loading]);

//   async function generateAnswer(e) {
//     e.preventDefault();
//     if (!question.trim()) return;

//     const userMsg = question.trim();
//     setQuestion("");
//     setLoading(true);

//     setChatHistory((prev) => [...prev, { type: "question", content: userMsg }]);

//     try {
//       const model = genAI.getGenerativeModel({
//   model: "gemini-2.5-flash",
// });

//       // const model = genAI.getGenerativeModel({
//       //  model: "gemini-1.5-flash-8b",
//       // });

//       const result = await model.generateContent(userMsg);
//       const text = result.response.text();

//       setChatHistory((prev) => [
//         ...prev,
//         { type: "answer", content: text },
//       ]);
//     } catch (error) {
//       console.error(error);
//       setChatHistory((prev) => [
//         ...prev,
//         { type: "answer", content: "Error: " + error.message },
//       ]);
//     }

//     setLoading(false);
//   }

//   return (
//     <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
//       <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
//         <header className="text-center py-4">
//           <h1 className="text-4xl font-bold text-blue-500">Chat AI</h1>
//         </header>

//         <div
//           ref={chatRef}
//           className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4"
//         >
//           {chatHistory.map((chat, index) => (
//             <div
//               key={index}
//               className={`mb-4 ${
//                 chat.type === "question" ? "text-right" : "text-left"
//               }`}
//             >
//               <div
//                 className={`inline-block max-w-[80%] p-3 rounded-lg ${
//                   chat.type === "question"
//                     ? "bg-blue-500 text-white"
//                     : "bg-gray-100 text-gray-800"
//                 }`}
//               >
//                 <ReactMarkdown>{chat.content}</ReactMarkdown>
//               </div>
//             </div>
//           ))}

//           {loading && (
//             <div className="text-left">
//               <div className="inline-block bg-gray-200 p-3 rounded-lg animate-pulse">
//                 Thinking…
//               </div>
//             </div>
//           )}
//         </div>

//         <form onSubmit={generateAnswer} className="bg-white rounded-lg shadow-lg p-4">
//           <div className="flex gap-2">
//             <textarea
//               required
//               className="flex-1 border border-gray-300 rounded p-3"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Ask anything..."
//               rows="2"
//             ></textarea>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-500 text-white rounded-md"
//             >
//               Send
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default App;




























// import { useState, useRef, useEffect } from "react";
// import "./App.css";
// import axios from "axios";
// import ReactMarkdown from "react-markdown";

// function App() {
//   const [chatHistory, setChatHistory] = useState([]);
//   const [question, setQuestion] = useState("");
//   const [answer, setAnswer] = useState("");
//   const [generatingAnswer, setGeneratingAnswer] = useState(false);

//   const chatContainerRef = useRef(null);

//   useEffect(() => {
//     if (chatContainerRef.current) {
//       chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
//     }
//   }, [chatHistory, generatingAnswer]);

//   async function generateAnswer(e) {
//     e.preventDefault();
//     if (!question.trim()) return;
    
//     setGeneratingAnswer(true);
//     const currentQuestion = question;
//     setQuestion(""); // Clear input immediately after sending
    
//     // Add user question to chat history
//     setChatHistory(prev => [...prev, { type: 'question', content: currentQuestion }]);
    
//     try {
//       const response = await axios({
//         url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${
//           import.meta.env.VITE_API_GENERATIVE_LANGUAGE_CLIENT
//         }`,
//         method: "post",
//         data: {
//           contents: [{ parts: [{ text: question }] }],
//         },
//       });

//       const aiResponse = response["data"]["candidates"][0]["content"]["parts"][0]["text"];
//       setChatHistory(prev => [...prev, { type: 'answer', content: aiResponse }]);
//       setAnswer(aiResponse);
//     } catch (error) {
//       console.log(error);
//       setAnswer("Sorry - Something went wrong. Please try again!");
//     }
//     setGeneratingAnswer(false);
//   }

//   return (
//     <div className="fixed inset-0 bg-gradient-to-r from-blue-50 to-blue-100">
//       <div className="h-full max-w-4xl mx-auto flex flex-col p-3">
//         {/* Fixed Header */}
//         <header className="text-center py-4">
//           <a href="https://github.com/Vishesh-Pandey/chat-ai" 
//              target="_blank" 
//              rel="noopener noreferrer"
//              className="block">
//             <h1 className="text-4xl font-bold text-blue-500 hover:text-blue-600 transition-colors">
//               Chat AI
//             </h1>
//           </a>
//         </header>

//         {/* Scrollable Chat Container - Updated className */}
//         <div 
//           ref={chatContainerRef}
//           className="flex-1 overflow-y-auto mb-4 rounded-lg bg-white shadow-lg p-4 hide-scrollbar"
//         >
//           {chatHistory.length === 0 ? (
//             <div className="h-full flex flex-col items-center justify-center text-center p-6">
//               <div className="bg-blue-50 rounded-xl p-8 max-w-2xl">
//                 <h2 className="text-2xl font-bold text-blue-600 mb-4">Welcome to Chat AI! 👋</h2>
//                 <p className="text-gray-600 mb-4">
//                   I'm here to help you with anything you'd like to know. You can ask me about:
//                 </p>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
//                   <div className="bg-white p-4 rounded-lg shadow-sm">
//                     <span className="text-blue-500">💡</span> General knowledge
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow-sm">
//                     <span className="text-blue-500">🔧</span> Technical questions
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow-sm">
//                     <span className="text-blue-500">📝</span> Writing assistance
//                   </div>
//                   <div className="bg-white p-4 rounded-lg shadow-sm">
//                     <span className="text-blue-500">🤔</span> Problem solving
//                   </div>
//                 </div>
//                 <p className="text-gray-500 mt-6 text-sm">
//                   Just type your question below and press Enter or click Send!
//                 </p>
//               </div>
//             </div>
//           ) : (
//             <>
//               {chatHistory.map((chat, index) => (
//                 <div key={index} className={`mb-4 ${chat.type === 'question' ? 'text-right' : 'text-left'}`}>
//                   <div className={`inline-block max-w-[80%] p-3 rounded-lg overflow-auto hide-scrollbar ${
//                     chat.type === 'question' 
//                       ? 'bg-blue-500 text-white rounded-br-none'
//                       : 'bg-gray-100 text-gray-800 rounded-bl-none'
//                   }`}>
//                     <ReactMarkdown className="overflow-auto hide-scrollbar">{chat.content}</ReactMarkdown>
//                   </div>
//                 </div>
//               ))}
//             </>
//           )}
//           {generatingAnswer && (
//             <div className="text-left">
//               <div className="inline-block bg-gray-100 p-3 rounded-lg animate-pulse">
//                 Thinking...
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Fixed Input Form */}
//         <form onSubmit={generateAnswer} className="bg-white rounded-lg shadow-lg p-4">
//           <div className="flex gap-2">
//             <textarea
//               required
//               className="flex-1 border border-gray-300 rounded p-3 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 resize-none"
//               value={question}
//               onChange={(e) => setQuestion(e.target.value)}
//               placeholder="Ask anything..."
//               rows="2"
//               onKeyDown={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) {
//                   e.preventDefault();
//                   generateAnswer(e);
//                 }
//               }}
//             ></textarea>
//             <button
//               type="submit"
//               className={`px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors ${
//                 generatingAnswer ? 'opacity-50 cursor-not-allowed' : ''
//               }`}
//               disabled={generatingAnswer}
//             >
//               Send
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default App;
