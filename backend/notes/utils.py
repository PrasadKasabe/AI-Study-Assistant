import os
import google.generativeai as genai

def extract_text_from_image(file_bytes, mime_type):
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set.")
    
    genai.configure(api_key=api_key)
    # Using gemini-flash-latest as it is fast and supports vision
    model = genai.GenerativeModel('gemini-flash-latest')
    
    prompt = "Please extract all the handwritten or printed text from this image exactly as written. Do not add any formatting or conversational text, just return the raw text. If the text is illegible, try your best to decipher it."
    
    try:
        response = model.generate_content([
            prompt,
            {"mime_type": mime_type, "data": file_bytes}
        ])
        return response.text
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""
