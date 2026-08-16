import os
from openai import OpenAI
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

SYSTEM_PROMPT_RECRUITER = (
    "You are an expert technical recruiter. Your goal is to conduct a professional, "
    "challenging, and adaptive interview for the candidate. "
    "Use the provided Job Title and Job Description as context. "
    "Ask one question at a time. "
    "Analyze the user's previous answer to determine if you should dive deeper into "
    "a specific topic to verify their competence or move to the next key competency. "
    "Keep your tone professional and encouraging. "
    "When you feel you have enough information to evaluate the candidate (usually after 5-7 questions), "
    "indicate that the interview is complete by starting your response with '[COMPLETE]'."
)

SYSTEM_PROMPT_REPORT = (
    "You are an expert interview evaluator. Analyze the provided interview transcript "
    "consisting of questions and answers. Evaluate the candidate based on the "
    "provided Job Description. "
    "You must return the response in strict JSON format with the following keys: "
    " 'overall_score' (integer from 1-100), "
    " 'strengths' (list of strings), "
    " 'weaknesses' (list of strings), "
    " 'improvement_tips' (list of strings), "
    " 'detailed_feedback' (string). "
    "Do not include any markdown formatting (like ```json) in your output, just the raw JSON string."
)

def generate_question(job_title: str, job_description: str, history: List[Dict[str, str]]) -> str:
    messages = [
        {"role": "system", "content": f"{SYSTEM_PROMPT_RECRUITER}\n\nJob Title: {job_title}\nJob Description: {job_description}"}
    ]
    messages.extend(history)

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.7
    )
    return response.choices[0].message.content

def generate_report(job_description: str, transcript: List[Dict[str, str]]) -> Dict[str, Any]:
    transcript_text = "\n".join([f"Q: {m['content']}\nA: {m['content']}" for m in transcript if m['role'] != 'system'])

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT_REPORT},
        {"role": "user", "content": f"Job Description:\n{job_description}\n\nInterview Transcript:\n{transcript_text}"}
    ]

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        response_format={"type": "json_object"},
        temperature=0.5
    )
    return response.choices[0].message.content
