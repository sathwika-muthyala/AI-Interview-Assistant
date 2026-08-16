import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_flow():
    print("Testing User Creation...")
    user_id = str(uuid.uuid4())
    # Since our API creates a user with a random UUID, we just create one.
    user_res = requests.post(f"{BASE_URL}/users", json={"username": "testuser", "email": "test@example.com"}).json()
    user_id = user_res['user_id']
    print(f"User created: {user_id}")

    print("\nTesting Interview Start...")
    interview_res = requests.post(f"{BASE_URL}/interviews", json={
        "user_id": user_id,
        "job_title": "Software Engineer",
        "job_description": "Looking for a Python expert with FastAPI experience."
    }).json()
    interview_id = interview_res['interview_id']
    print(f"Interview started: {interview_id}")

    # Simulating 3 rounds of questions
    current_q = None
    # Note: The /interviews endpoint returned a first_question in our design,
    # but let's assume we get the first one from the database or the response.
    # Since the response from /interviews is now InterviewStartResponse:
    # interview_res = requests.post(...)
    # current_q = interview_res['first_question']

    print("\nSimulating Answers...")
    # For testing, we'll use the /latest-question endpoint to get the first one.
    q_res = requests.get(f"{BASE_URL}/interviews/{interview_id}/latest-question").json()
    current_q = q_res

    for i in range(3):
        print(f"Question {i+1}: {current_q['question_text']}")
        ans_res = requests.post(f"{BASE_URL}/interviews/{interview_id}/answer", json={
            "question_id": current_q['question_id'],
            "answer_text": "I have extensive experience with that."
        }).json()

        if ans_res['is_completed']:
            print("Interview completed by AI.")
            break

        current_q = ans_res['next_question']

    print("\nTesting Report Retrieval...")
    # We might need to answer more to trigger completion, or manually trigger it.
    # For this test, we just check if the report exists.
    report_res = requests.get(f"{BASE_URL}/interviews/{interview_id}/report")
    if report_res.status_code == 200:
        print("Report retrieved successfully!")
    else:
        print("Report not found (Expected if interview not completed)")

if __name__ == "__main__":
    test_flow()
