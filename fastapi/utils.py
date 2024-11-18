from sqlmodel import SQLModel

def get_sql_from_answer_llm(answer: str):
    return answer.split("```sql")[1].split("```")[0].strip()


