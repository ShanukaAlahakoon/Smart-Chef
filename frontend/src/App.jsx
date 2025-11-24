import { useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!image) return alert("Please select an image first!");

    setLoading(true);
    const formData = new FormData();
    formData.append("file", image);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/analyze-image",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Something went wrong! Check if Backend is running.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        {/* Header Section - Clean & Minimal */}
        <div className="bg-white p-10 text-center border-b border-slate-100">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-100 rounded-full mb-4">
            <span className="text-3xl">👨‍🍳</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            Smart Chef <span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Turn your fridge ingredients into a 5-star meal. Upload a photo and
            let our AI curate a recipe for you.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-8 md:p-12 bg-white">
          {/* Upload Section - Professional Dropzone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            {/* Left Side: Upload Control */}
            <div className="space-y-6">
              <div
                className={`group relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ease-in-out
                  ${
                    image
                      ? "border-emerald-500 bg-emerald-50/30"
                      : "border-slate-300 hover:border-emerald-500 hover:bg-slate-50"
                  }`}
              >
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-slate-400 group-hover:text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-700">
                      {image ? image.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">
                      JPG, PNG up to 10MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleUpload}
                disabled={loading}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 shadow-sm
                  ${
                    loading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg transform hover:-translate-y-0.5"
                  }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                    Analyzing Ingredients...
                  </span>
                ) : (
                  "Generate Recipe ✨"
                )}
              </button>
            </div>

            {/* Right Side: Preview */}
            <div className="flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100 h-full min-h-[300px]">
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-80 w-full object-contain rounded-xl p-2"
                />
              ) : (
                <div className="text-slate-400 text-center">
                  <span className="text-4xl block mb-2">🖼️</span>
                  <span className="text-sm">
                    Image preview will appear here
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Result Section */}
          {result && (
            <div className="mt-16 space-y-10 animate-fade-in">
              {/* Ingredients Section */}
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-sm">
                    🛒
                  </span>
                  Detected Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.ingredients.length > 0 ? (
                    result.ingredients.map((item, index) => (
                      <span
                        key={index}
                        className="bg-white text-slate-700 px-4 py-2 rounded-full text-sm font-medium border border-slate-200 shadow-sm flex items-center gap-2"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-500 italic">
                      No recognizable ingredients found.
                    </span>
                  )}
                </div>
              </div>

              {/* Recipe Card - Clean Modern Style */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-white px-8 py-6 border-b border-slate-200 flex items-center gap-3">
                  <span className="text-2xl">📜</span>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Chef's Recommendation
                  </h3>
                </div>

                <div className="p-8">
                  {/* Markdown Content */}
                  <article
                    className="prose prose-slate prose-lg max-w-none
                    prose-headings:text-slate-800 
                    prose-a:text-emerald-600 
                    prose-strong:text-emerald-700
                    prose-li:marker:text-emerald-500"
                  >
                    <ReactMarkdown>{result.recipe}</ReactMarkdown>
                  </article>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-slate-400 text-sm mt-8">
        Powered by YOLOv8 & Gemini 2.0 Flash
      </div>
    </div>
  );
}

export default App;
