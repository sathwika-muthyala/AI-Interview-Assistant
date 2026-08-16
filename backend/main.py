from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
import json

from .database import engine, get_db, Base
from . import models, schemas
from .openai_client import generate_question, generate_report

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Interview Assistant API")

@app.post("/users", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = models.User(username=user.username, email=user.email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users/{user_id}/interviews", response_model=List[schemas.InterviewResponse])
def get_user_interviews(user_id: UUID, db: Session = Depends(get_db)):
    return db.query(models.Interview).filter(models.Interview.user_id == user_id).all()

@app.post("/interviews", response_model=schemas.InterviewStartResponse)
def start_interview(interview: schemas.InterviewCreate, db: Session = Depends(get_db)):
    # Ensure user exists
    user = db.query(models.User).filter(models.User.user_id == interview.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Create Interview
    db_interview = models.Interview(
        user_id=interview.user_id,
        job_title=interview.job_title,
        job_description=interview.job_description
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # Generate first question
    first_q_text = generate_question(
        db_interview.job_title,
        db_interview.job_description,
        []
    )

    db_question = models.Question(
        interview_id=db_interview.interview_id,
        question_text=first_q_text,
        order=1
    )
    db.add(db_question)
    db.commit()
    db.refresh(db_question)

    return {
        "interview_id": db_interview.interview_id,
        "first_question": db_question
    }

@app.post("/interviews/{interview_id}/answer", response_model=schemas.NextQuestionResponse)
def submit_answer(interview_id: UUID, answer: schemas.AnswerCreate, db: Session = Depends(get_db)):
    interview = db.query(models.Interview).filter(models.Interview.interview_id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Save answer
    db_answer = models.Answer(
        question_id=answer.question_id,
        answer_text=answer.answer_text
    )
    db.add(db_answer)
    db.commit()

    # Build history for AI
    history = []
    qs = db.query(models.Question).filter(models.Question.interview_id == interview_id).order_by(models.Question.order).all()
    for q in qs:
        history.append({"role": "assistant", "content": q.question_text})
        ans = db.query(models.Answer).filter(models.Answer.question_id == q.question_id).first()
        if ans:
            history.append({"role": "user", "content": ans.answer_text})

    # Ensure the latest answer is included if it wasn't in the loop
    # (The loop above handles it because we committed db_answer first)

    # Generate next question
    next_q_text = generate_question(
        interview.job_title,
        interview.job_description,
        history
    )

    if next_q_text.startswith("[COMPLETE]"):
        # End interview
        interview.status = "completed"
        db.commit()

        # Generate report
        report_json_str = generate_report(interview.job_description, history)
        report_data = json.loads(report_json_str)

        db_report = models.Report(
            interview_id=interview.interview_id,
            strengths=report_data.get("strengths", []),
            weaknesses=report_data.get("weaknesses", []),
            improvement_tips=report_data.get("improvement_tips", []),
            detailed_feedback=report_data.get("detailed_feedback", ""),
        )
        db.add(db_report)

        interview.overall_score = report_data.get("overall_score")

        db.commit()

        return {"next_question": None, "is_completed": True}

    # Save next question
    db_next_q = models.Question(
        interview_id=interview.interview_id,
        question_text=next_q_text,
        order=len(qs) + 1
    )
    db.add(db_next_q)
    db.commit()
    db.refresh(db_next_q)

    return {
        "next_question": db_next_q,
        "is_completed": False
    }

@app.get("/interviews/{interview_id}/report", response_model=schemas.ReportResponse)
def get_report(interview_id: UUID, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.interview_id == interview_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found. Interview may still be ongoing.")
    return report
\n@app.get('/interviews/{interview_id}/latest-question', response_model=schemas.QuestionResponse)\ndef get_latest_question(interview_id: UUID, db: Session = Depends(get_db)):\n    question = db.query(models.Question).filter(models.Question.interview_id == interview_id).order_by(models.Question.order.desc()).first()\n    if not question:\n        raise HTTPException(status_code=404, detail='No questions found for this interview')\n    return question
