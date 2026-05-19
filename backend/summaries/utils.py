import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def generate_full_summary(text, summary_type='detailed', user_groq_key=None, user_gemini_key=None):
    summary_instruction = "Provide a detailed summary of the following text, including key sections and a comprehensive overview. Write in extremely simple, easy-to-understand language as if explaining to a high school student."
    if summary_type == 'short':
        summary_instruction = "Provide a concise 3-5 sentence summary of the following text using very simple language."
        
    prompt = f"""Please analyze the following text and provide three separate sections.
    IMPORTANT: Use extremely simple, clear, and easy-to-understand language without complex jargon.
    
    1. SUMMARY: {summary_instruction}
    2. KEY POINTS: Extract the top 5-10 key points as a bulleted list using simple terms.
    3. QUESTIONS: Generate 5 important study questions based on the text that are easy to understand.
    
    Format your response EXACTLY like this with these exact section headers:
    ===SUMMARY===
    [Your summary here]
    
    ===KEY POINTS===
    [Your key points here]
    
    ===QUESTIONS===
    [Your questions here]

    Text to analyze:
    {text}
    """
    
    content = ""
    
    # Decide which keys to use
    groq_key = user_groq_key if user_groq_key else os.getenv("GROQ_API_KEY")
    gemini_key = user_gemini_key if user_gemini_key else os.getenv("GEMINI_API_KEY")

    try:
        # Create client with the chosen key
        groq_client = Groq(api_key=groq_key)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=4096,
        )
        content = response.choices[0].message.content
    except Exception as e:
        print(f"Groq API error (Key: {groq_key[:6]}...): {e}. Falling back to Gemini API.")
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        # Using gemini-flash-latest as it is fast and has a high free tier limit
        model = genai.GenerativeModel('gemini-flash-latest')
        try:
            fallback_response = model.generate_content(prompt)
            content = fallback_response.text
        except Exception as gem_e:
            print(f"Gemini API fallback error (Key: {gemini_key[:6]}...): {gem_e}")
            raise Exception(f"Both AI providers failed. {e}")

    # Parse the response
    sections = {
        'summary': 'Summary could not be generated.',
        'key_points': 'Key points could not be generated.',
        'questions': 'Questions could not be generated.'
    }
    
    try:
        parts = content.split('===')
        for i in range(len(parts)):
            if 'SUMMARY' in parts[i] and i + 1 < len(parts):
                sections['summary'] = parts[i+1].strip()
            elif 'KEY POINTS' in parts[i] and i + 1 < len(parts):
                sections['key_points'] = parts[i+1].strip()
            elif 'QUESTIONS' in parts[i] and i + 1 < len(parts):
                sections['questions'] = parts[i+1].strip()
    except Exception as e:
        print("Parsing error:", e)
        sections['summary'] = content # Fallback to raw content if parsing fails

    return sections
