import { useState, useRef } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState("message"); // "message" or "audio"
  const [audioFile, setAudioFile] = useState(null);
  const [audioFileName, setAudioFileName] = useState("");
  const [audioProcessing, setAudioProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // Check if an intent is a false positive (legitimate) based on the string
  const isFalsePositive = (intent) => {
    const lowerIntent = intent.toLowerCase();
    return (
      lowerIntent.includes("false") ||
      lowerIntent.includes("false positive") ||
      lowerIntent.includes("generic") ||
      lowerIntent.includes("neutral") ||
      lowerIntent.includes("generic/neutral")
    );
  };
  

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check if file is an audio file
      if (!file.type.match("audio.*")) {
        setError("Please upload an audio file (WAV, MP3, M4A)");
        return;
      }

      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setAudioFile(file);
      setAudioFileName(file.name);
      setError(null);

      // Process the audio file for speech-to-text
      processAudioFile(file);
    }
  };

  const processAudioFile = async (file) => {
    setAudioProcessing(true);
    setMessage("");

    try {
      // Create a FormData object to send the file to Google Speech-to-Text API
      const formData = new FormData();
      formData.append("audio", file);

      // Add configuration parameters for Google Speech-to-Text
      formData.append(
        "config",
        JSON.stringify({
          languageCode: "en-US",
          enableAutomaticPunctuation: true,
          model: "default",
          audioChannelCount: 1,
          enableWordTimeOffsets: false,
        })
      );

      // In a production environment, you would send this to your backend proxy
      // which would handle the Google Cloud authentication and API call

      // Example of calling your backend proxy for Google Speech-to-Text
      const response = await fetch("https://your-backend-api/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: Failed to convert speech to text`
        );
      }

      const data = await response.json();

      // Google Speech-to-Text returns results in a specific format
      // Your backend would parse and return the transcription
      setMessage(data.transcription);
      setAudioProcessing(false);

      /* For testing purposes, we'll simulate a response */
      /* Remove this code when your backend is ready */
      setTimeout(() => {
        const simulatedText = `This is the transcribed content from the audio file "${file.name}" using Google Speech-to-Text API. In a real implementation, this would contain the actual transcription results from Google's service.`;
        setMessage(simulatedText);
        setAudioProcessing(false);
      }, 2000);
    } catch (err) {
      console.error("Speech-to-text error:", err);
      setError(err.message || "Failed to process audio file");
      setAudioProcessing(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];

      if (!file.type.match("audio.*")) {
        setError("Please upload an audio file (WAV, MP3, M4A)");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      setAudioFile(file);
      setAudioFileName(file.name);
      setError(null);

      processAudioFile(file);
    }
  };

  const handleCheck = async () => {
    if (!message.trim() && activeTab === "message") {
      setError("Please enter a message to check.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        "https://e422-102-208-89-6.ngrok-free.app/predict",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: message }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: Failed to fetch response from server.`
        );
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-2 bg-gradient-to-r from-teal-600 to-cyan-600 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-shield-check h-8 w-8 text-white"
            >
              <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Financial Fraud Detection
          </h1>
          <p className="text-slate-500 max-w-md mx-auto">
            Secure verification service for financial communications
          </p>
        </div>

        <div className="rounded-lg text-card-foreground mb-8 border-0 shadow-lg bg-white">
          <div className="flex flex-col space-y-1.5 p-6 bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
            <div className="text-2xl font-semibold leading-none tracking-tight">
              Content Verification
            </div>
            <div className="text-sm text-slate-300">
              Upload a message to check for potentially
              fraudulent information.
            </div>
          </div>

          <div className="p-6 pt-6">
            <div className="w-full">
              <div className="h-10 items-center justify-center rounded-md p-1 text-muted-foreground grid w-full grid-cols-2 mb-6 bg-slate-100">
              </div>

              <div className="mt-2 space-y-4">
                <div>
                  <textarea
                    className="flex w-full rounded-md border bg-background px-3 py-2 text-base min-h-[200px] border-slate-200 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Paste the message content here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  ></textarea>
                  {error && (
                    <p className="text-red-600 mt-2 text-sm">{error}</p>
                  )}
                </div>
              </div>
            </div>

            {result && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-slate-200">
                <h2 className="text-lg font-semibold text-gray-700 mb-2">
                  Analysis Results
                </h2>
                <div className="p-4 bg-white rounded-md border border-slate-200">
                  <div className="flex items-center mb-4">
                    {isFalsePositive(result.intent) ? (
                      <>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-600"
                          >
                            <path d="M20 6 9 17l-5-5"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-green-700">
                            Legitimate Message
                          </div>
                          <div className="text-sm text-slate-600">
                            No signs of fraudulent content detected
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-red-600"
                          >
                            <path d="M18 6 6 18"></path>
                            <path d="m6 6 12 12"></path>
                          </svg>
                        </div>
                        <div>
                          <div className="font-semibold text-red-700">
                            Suspicious Message
                          </div>
                          <div className="text-sm text-slate-600">
                            Potential fraud detected
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-slate-500 mb-1">
                      Detected Intent
                    </div>
                    <div
                      className={`text-xl font-bold ${
                        isFalsePositive(result.intent)
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {result.intent}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded border border-slate-200 text-sm">
                    <div className="font-medium mb-1">
                      Security Recommendation
                    </div>
                    {isFalsePositive(result.intent) ? (
                      <p className="text-slate-700">
                        This message appears to be legitimate. It's safe to
                        proceed, but always exercise caution with financial
                        information.
                      </p>
                    ) : (
                      <p className="text-slate-700">
                        This message contains suspicious content related to "
                        {result.intent}". Do not share sensitive information or
                        follow any instructions from this sender.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="items-center p-6 flex justify-between border-t border-slate-100 py-4">
          <div className="text-sm text-slate-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-info h-4 w-4 mr-2 text-cyan-600"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
            Your data is processed securely and not stored
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white"
            onClick={handleCheck}
            disabled={loading || (message.trim() === "" && !audioFile)}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Checking...
              </>
            ) : (
              "Check"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
