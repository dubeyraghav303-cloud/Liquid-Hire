import os
from io import BytesIO
from typing import List, Literal, Optional

import fitz  # PyMuPDF
from groq import Groq
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


load_dotenv()


GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = None
if GROQ_API_KEY:
    client = Groq(api_key=GROQ_API_KEY)
else:
    print("Warning: GROQ_API_KEY not set found environment variables.")

MODEL_NAME = "llama-3.1-8b-instant"

def generate_groq_response(messages, system_instruction=None, json_mode=False) -> Optional[str]:
    if not client:
        return "Error: Groq API key missing."
    
    try:
        # Prepare messages
        all_messages = []
        if system_instruction:
            all_messages.append({"role": "system", "content": system_instruction})
        
        all_messages.extend(messages)

        kwargs = {
            "model": MODEL_NAME,
            "messages": all_messages,
            "temperature": 0.6,
            "max_tokens": 1024,
            "top_p": 1,
            "stop": None,
            "stream": False
        }
        
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        completion = client.chat.completions.create(**kwargs)
        return completion.choices[0].message.content
    except Exception as e:
        print(f"Groq API Error: {e}")
        return None


class HistoryItem(BaseModel):
  role: Literal["user", "model", "system", "assistant"] = "user" # assistant is valid for OpenAI/Groq
  content: str


class InterviewState(BaseModel):
  resume_text: str
  job_role: str
  history: List[HistoryItem]
  current_answer: str


app = FastAPI(
  title="LiquidHire Interview Backend",
  version="0.1.0",
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


SYSTEM_TEMPLATE = """You are a strict but fair technical interviewer for a {job_role} position.
The candidate's resume text is provided below. 
RESUME: {resume_text}

Rules:
- If the resume text is empty or sparse, ASK the candidate to introduce themselves first. Do NOT invent a name or background.
- Do NOT address the candidate as "Alex" or any other name unless it is clearly stated in the resume. 
- Base your questions ONLY on the provided resume and the job role.
- Keep responses concise (under 3 sentences) for conversational flow.
- Do not greet again if history already exists.
"""

@app.post("/api/chat")
async def chat(state: InterviewState):
    # Construct history for Groq
    messages = []
    
    # format system prompt
    sys_prompt = SYSTEM_TEMPLATE.format(job_role=state.job_role, resume_text=state.resume_text)
    
    for item in state.history:
        role = "assistant" if item.role == "model" else item.role
        messages.append({"role": role, "content": item.content})
    
    # Add current user answer if it exists and isn't START_INTERVIEW
    if state.current_answer != "START_INTERVIEW":
        messages.append({"role": "user", "content": state.current_answer})
    else:
        # If starting, we want the system to initiate. 
        # But LLMs usually respond to a user message. 
        # We can add a hidden instruction or just let the system prompt drive it.
        # Let's add a "system" trigger if history is empty.
        if not messages:
             messages.append({"role": "user", "content": "I am ready for the interview. Please start."})

    response_text = generate_groq_response(messages, system_instruction=sys_prompt)
    
    return {
        "next_question": response_text or "I'm unable to respond right now.",
        "feedback": "Live evaluation updated",
        "facial_analysis_alert": False,
    }


class EndInterviewRequest(BaseModel):
    history: List[HistoryItem]
    job_role: str
    resume_text: str = ""

@app.post("/api/end-interview")
async def end_interview(request: EndInterviewRequest):
    # Construct the full conversation for analysis
    transcript_text = ""
    for item in request.history:
        role = "Interviewer" if item.role == "model" else "Candidate"
        transcript_text += f"{role}: {item.content}\n"

    prompt = f"""
    TRANSCRIPT:
    {transcript_text}
    
    Analyze the above interview for the role of {request.job_role}.
    Output strictly valid JSON with this structure:
    {{
      "overall_score": <integer_0_to_100>,
      "overall_summary": "<summary>",
      "questions": [
        {{
            "question": "<text>",
            "user_answer": "<summary>",
            "score": <0_to_10>,
            "feedback": "<text>",
            "ideal_answer": "<text>"
        }}
      ]
    }}
    """

    try:
        response_text = generate_groq_response(
            [{"role": "user", "content": prompt}], 
            system_instruction="You are a strict technical interviewer. Output valid JSON only.",
            json_mode=True
        )
        
        if not response_text:
            raise Exception("Failed to generate report.")

        print(f"DEBUG: Raw Groq response: {response_text}")

        # Parse JSON response
        import json
        result = json.loads(response_text)
        
        return {
            "score": result.get("overall_score", 0),
            "summary": result.get("overall_summary", "No summary provided."),
            "json_report": result.get("questions", [])
        }
    except Exception as e:
        print(f"Scoring error: {e}")
        return {"score": 0, "summary": "Error generating score.", "json_report": []}

@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
  if file.content_type not in ("application/pdf", "application/octet-stream"):
    return {"text": ""}

  data = await file.read()
  stream = BytesIO(data)
  text = ""
  with fitz.open(stream=stream, filetype="pdf") as doc:
    for page in doc:
      text += page.get_text()

  return {"text": text.strip()}


# Job Scraping

# Job Scraping
from jobspy import scrape_jobs
import pandas as pd
import time
import logging
from typing import List, Dict

# Set up logging 
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class InternshipScraper:
    """
    A class to scrape internship data from various job boards using the jobspy library.
    """
    
    def __init__(self):
        self.sites = ['linkedin', 'indeed', 'glassdoor']
        self.internship_keywords = [
            'intern', 'internship', 'co-op', 'coop', 'trainee', 'apprentice',
            'entry level', 'junior', 'graduate', 'student', 'summer intern'
        ]
    
    def scrape_internships(self, 
                          skills: List[str], 
                          location: str = "Remote", 
                          max_results: int = 15) -> pd.DataFrame:
        logger.info(f"Starting to scrape internships for skills: {skills}")
        
        all_internships = []
        
        # Create search terms combining skills with internship keywords
        search_terms = self._create_search_terms(skills)
        
        for search_term in search_terms:
            logger.info(f"Searching for: {search_term}")
            
            try:
                # Scrape jobs using jobspy
                jobs = scrape_jobs(
                    site_name=self.sites,
                    search_term=search_term,
                    location=location,
                    results_wanted=min(max_results, 20),
                    hours_old=168,  # Last 7 days default, feature removed from output but kept for query
                    country_watchlist=["US", "CA", "IN"]
                )
                
                if jobs is not None and not jobs.empty:
                    # Convert DataFrame to list of dictionaries
                    jobs_list = jobs.to_dict('records')
                    # Filter for internships
                    internship_jobs = self._filter_internships(jobs_list)
                    all_internships.extend(internship_jobs)
                    logger.info(f"Found {len(internship_jobs)} internships for '{search_term}'")
                
                # Add delay to avoid rate limiting
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error scraping for '{search_term}': {str(e)}")
                continue
        
        if not all_internships:
            logger.warning("No internships found")
            return pd.DataFrame()
        
        # Convert to DataFrame and clean data
        df = pd.DataFrame(all_internships)
        df = self._clean_and_enhance_data(df, skills)
        
        # Remove duplicates
        df = df.drop_duplicates(subset=['title', 'company', 'location'], keep='first')
        
        logger.info(f"Total unique internships found: {len(df)}")
        return df.head(max_results)
    
    def _create_search_terms(self, skills: List[str]) -> List[str]:
        search_terms = []
        # Add individual skills with internship keywords (simplified)
        for skill in skills[:3]:  
            search_terms.append(f"{skill} internship")
        return search_terms
    
    def _filter_internships(self, jobs: List[Dict]) -> List[Dict]:
        internships = []
        for job in jobs:
            title = str(job.get('title', '') or '').lower()
            description = str(job.get('description', '') or '').lower()
            
            # Check if it's an internship
            is_internship = any(keyword in title or keyword in description 
                              for keyword in self.internship_keywords)
            
            # Exclude senior/lead positions
            is_not_senior = not any(senior_word in title 
                                  for senior_word in ['senior', 'lead', 'principal', 'manager', 'director'])
            
            if is_internship and is_not_senior:
                internships.append(job)
        return internships
    
    def _clean_and_enhance_data(self, df: pd.DataFrame, user_skills: List[str]) -> pd.DataFrame:
        if df.empty: return df
        
        # Clean data
        df['company'] = df['company'].fillna('Unknown Company').str.strip()
        df['title'] = df['title'].fillna('Unknown Title').str.strip()
        df['location'] = df['location'].fillna('Not specified').str.strip()
        df['apply_url'] = df['job_url'].fillna('')
        
        # Calculate relevance score based on user skills
        df['relevance_score'] = df.apply(
            lambda row: self._calculate_relevance_score(row, user_skills), axis=1
        )
        
        # Select and rename columns (Using available columns from JobSpy + relevance)
        # JobSpy returns: title, company, location, description, job_url, etc.
        # We removed stipend and days_old.
        
        desired_columns = ['title', 'company', 'location', 'description', 'apply_url', 'relevance_score', 'job_url']
        existing_cols = [c for c in desired_columns if c in df.columns]
        
        df = df[existing_cols]
        return df
    
    def _calculate_relevance_score(self, row: pd.Series, user_skills: List[str]) -> float:
        title = str(row.get('title', '')).lower()
        description = str(row.get('description', '')).lower()
        company = str(row.get('company', '')).lower()
        text = f"{title} {description} {company}"
        
        skill_matches = sum(1 for skill in user_skills if skill.lower() in text)
        base_score = (skill_matches / max(len(user_skills), 1)) * 10
        
        title_bonus = sum(1 for skill in user_skills if skill.lower() in title)
        
        internship_bonus = 0.5 if any(k in title for k in self.internship_keywords) else 0
        
        return round(min(10.0, base_score + title_bonus + internship_bonus), 2)


class JobSearchRequest(BaseModel):
    query: str
    location: str = "Remote"

@app.post("/api/jobs")
async def search_jobs(request: JobSearchRequest):
    scraper = InternshipScraper()
    
    # Treat query as comma separated skills if possible, else single skill
    skills = [s.strip() for s in request.query.split(",") if s.strip()]
    if not skills:
        skills = ["software engineer"] # Default

    print(f"Scraping internships for skills: {skills} in {request.location}")
    
    try:
        df = scraper.scrape_internships(skills=skills, location=request.location, max_results=15)
        
        if df.empty:
            return {"jobs": []}

        # Convert to list for JSON response
        jobs_data = df.to_dict(orient="records")
        
        cleaned_jobs = []
        for job in jobs_data:
            cleaned_jobs.append({
                "id": str(job.get("id", job.get("apply_url", ""))), 
                "title": job.get("title", "Unknown Role"),
                "company": job.get("company", "Unknown Company"),
                "location": job.get("location", "Remote"),
                "url": job.get("apply_url") or job.get("job_url", "#"),
                "description": str(job.get("description", ""))[:200] + "...",
                "source": "external",
                "relevance": job.get("relevance_score", 0)
            })
            
        return {"jobs": cleaned_jobs}

    except Exception as e:
        print(f"Job scraping error: {e}")
        return {"jobs": [], "error": str(e)}
