import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def get_chatbot_response(note_content, user_question, history=[], user_groq_key=None, user_gemini_key=None):
    # Construct the system prompt with context
    context = f"Context from uploaded notes:\n{note_content}\n\n"
    instructions = "Answer the user's question based ONLY on the context provided above. If the answer is not in the context, say you don't know based on the current notes."
    system_prompt = context + instructions
    
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(history)
    messages.append({"role": "user", "content": user_question})
    
    # Decide which keys to use
    groq_key = user_groq_key if user_groq_key else os.getenv("GROQ_API_KEY")
    gemini_key = user_gemini_key if user_gemini_key else os.getenv("GEMINI_API_KEY")

    try:
        groq_client = Groq(api_key=groq_key)
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Groq API error in chatbot (Key: {groq_key[:6]}...): {e}. Falling back to Gemini API.")
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel('gemini-flash-latest')
        
        # Convert messages to Gemini format string
        prompt = ""
        for m in messages:
            role = "System" if m['role'] == "system" else ("User" if m['role'] == "user" else "Assistant")
            prompt += f"{role}: {m['content']}\n\n"
        prompt += "Assistant:"
        
        try:
            fallback_response = model.generate_content(prompt)
            return fallback_response.text
        except Exception as gem_e:
            print(f"Gemini API fallback error in chatbot (Key: {gemini_key[:6]}...): {gem_e}")
            raise Exception(f"Both AI providers failed. {e}")
