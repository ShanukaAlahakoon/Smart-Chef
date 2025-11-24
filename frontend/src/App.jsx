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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header Section - Modern & Clean */}
        <div className="bg-white p-8 text-center border-b border-gray-100">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600">
            🍳 Fridge-to-Recipe GenAI
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Elevate your cooking. Upload a photo of your ingredients, and let AI
            curate a gourmet recipe just for you.
          </p>
        </div>

        {/* Main Content Area */}
        <div className="p-8 md:p-12">
          {/* Upload Section - Elegant Dropzone */}
          <div
            className={`group border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
              image
                ? "border-amber-400 bg-amber-50/30"
                : "border-gray-300 hover:border-amber-400 hover:bg-gray-50"
            }`}
          >
            <input
              type="file"
              onChange={handleImageChange}
              accept="image/*"
              className="block w-full text-sm text-gray-500
                file:mr-5 file:py-3 file:px-6
                file:rounded-full file:border-0
                file:text-sm file:font-bold
                file:bg-amber-50 file:text-amber-700
                hover:file:bg-amber-100 cursor-pointer transition-colors"
            />

            {preview && (
              <div className="mt-8 flex justify-center relative">
                <div className="p-2 bg-white rounded-2xl shadow-lg ring-1 ring-gray-100">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-80 rounded-xl object-cover"
                  />
                </div>
              </div>
            )}

            {/* Generate Button - Gradient & Shadow */}
            <button
              onClick={handleUpload}
              disabled={loading}
              className={`mt-10 w-full md:w-auto md:px-12 py-4 rounded-xl text-white font-bold text-lg tracking-wide transition-all duration-300 shadow-md
                ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-70"
                    : "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 hover:shadow-xl hover:-translate-y-1"
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
                  Crafting Recipe...
                </span>
              ) : (
                "Generate Gourmet Recipe 🥘"
              )}
            </button>
          </div>

          {/* Result Section */}
          {result && (
            <div className="mt-12 space-y-8 animate-fade-in-up">
              {/* Ingredients Tags - Sophisticated Palette */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-teal-600"></div>
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🛒 Detected Ingredients
                </h3>
                <div className="flex flex-wrap gap-3">
                  {result.ingredients.length > 0 ? (
                    result.ingredients.map((item, index) => (
                      <span
                        key={index}
                        className="bg-teal-50 text-teal-800 px-4 py-2 rounded-full text-sm font-medium border border-teal-100 shadow-sm"
                      >
                        {item}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 italic">
                      No specific ingredients detected.
                    </span>
                  )}
                </div>
              </div>

              {/* Recipe Card - Paper & Ink Feel */}
              {/* Recipe Card */}
              <div className="bg-amber-50/50 p-8 rounded-2xl shadow-inner border border-amber-100 relative">
                <h3 className="text-2xl font-bold text-amber-900 mb-6 flex items-center gap-3 pb-4 border-b border-amber-200">
                  📜 Chef's Suggestion
                </h3>

                {/* Markdown Component */}
                <article className="prose prose-lg prose-amber max-w-none">
                  <ReactMarkdown
                    components={
                      {
                        // අමතර Styles අවශ්‍ය නම් මෙතනට දාන්න පුළුවන්,
                        // නමුත් prose class එකෙන් ඔක්කොම ලස්සනට හදනවා.
                      }
                    }
                  >
                    {result.recipe}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
