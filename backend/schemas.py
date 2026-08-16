from pydantic import BaseModel, EmailStr
from typing import List, Optional
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewBase(BaseModel):
    job_title: str
    job_description: str
    user_id: UUID

class InterviewCreate(InterviewBase):
    pass

class InterviewResponse(InterviewBase):
    interview_id: UUID
    status: str
    overall_score: Optional[int]
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True

class QuestionResponse(BaseModel):
    question_id: UUID
    question_text: str
    order: int

    class Config:
        from_attributes = True

class AnswerCreate(BaseModel):
    question_id: UUID
    answer_text: str

class AnswerResponse(BaseModel):
    answer_id: UUID
    question_id: UUID
    answer_text: str
    created_at: datetime

    class Config:
        from_attributes = True

class ReportResponse(BaseModel):
    report_id: UUID
    interview_id: UUID
    strengths: List[str]
    weaknesses: List[str]
    improvement_tips: List[str]
    detailed_feedback: str
    created_at: datetime

    class Config:
        from_attributes = True

class InterviewStartResponse(BaseModel):
    interview_id: UUID
    first_question: QuestionResponse

class NextQuestionResponse(BaseModel):
    next_question: Optional[QuestionResponse]
    is_completed: bool
