import React, { useEffect } from "react";
import "./LanguageSelectorStyles.css";

const LanguageSelector = () => {
  useEffect(() => {
    //Prevent loading twice
    if (window.googleTranslateScriptAdded) return;
    window.googleTranslateScriptAdded = true;

    const googleTranslateScript = document.createElement("script");
    googleTranslateScript.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    googleTranslateScript.type = "text/javascript";
    googleTranslateScript.async = true;
    document.body.appendChild(googleTranslateScript);

    window.googleTranslateElementInit = () => {
      if (window.googleTranslateInitialized) return;
      window.googleTranslateInitialized = true;

      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,hi,mr",
          autoDisplay: false,
        },
        "google_translate_element"
      );
    };
  }, []);

  const handleLanguageChange = (e) => {
    const languageCode = e.target.value;
    if (!languageCode) return;

    const selectElement = document.querySelector(".goog-te-combo");
    if (selectElement) {
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event("change"));
    }
  };

  return (
    <div>
      <div id="google_translate_element" style={{ display: "none" }}></div>

      <select   className="mui-select" onChange={handleLanguageChange}>
        <option value="">Select Language</option>
        <option value="en">English</option>
        <option value="hi">Hindi</option>
        <option value="mr">Marathi</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
