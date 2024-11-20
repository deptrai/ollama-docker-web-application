import requests
from fastapi import FastAPI, Response

# Database
from db import (
    create_chat,
    get_all_chats,
    get_chat_by_id,
    delete_chat,
    DataChat,
    path_db
)

# Libs
from libs.langchain import *

# Utility
from utils import get_sql_from_answer_llm

#test on docker
url_docker = "http://ollama-server:11434"
#test on local
url_local = "http://localhost:11434"
model = "qwen2.5-coder:0.5b"

llm = OllamaLLM(
    base_url=url_local, 
    model=model,
    # temperature: độ sáng tạo của mô hình (0.0 - 1.0)
    # - Giá trị càng thấp càng ít sáng tạo, càng cao càng sáng tạo
    # - Nên tăng lên 0.7-0.8 để có câu trả lời đa dạng hơn
    temperature=0.1,  
    
    # top_k: số lượng token có xác suất cao nhất được chọn
    # - Giá trị càng cao càng đa dạng kết quả
    # - Nên tăng lên 40-50 để có nhiều lựa chọn token hơn
    top_k=10,
    
    # top_p: xác suất tích lũy của các token được chọn (0.0 - 1.0) 
    # - Giá trị càng cao càng đa dạng
    # - Nên giữ nguyên vì đã khá tốt
    top_p=0.95,
    
    # num_ctx: độ dài ngữ cảnh tối đa
    # - Giá trị càng cao càng nhớ được nhiều thông tin
    # - Nên tăng lên 4096 nếu cần xử lý văn bản dài
    num_ctx=2048,
    
    # num_thread: số luồng xử lý
    # - Giá trị càng cao càng nhanh
    # - Nên tăng lên 4 để tăng tốc độ xử lý
    num_thread=1,
    
    # num_predict: số token tối đa được sinh ra
    # - Giá trị càng cao càng dài câu trả lời
    # - Nên tăng lên 100-200 để có câu trả lời chi tiết hơn
    num_predict=200,
    
    # repeat_last_n: số token cuối cùng được xem xét để tránh lặp lại
    # - Giá trị càng cao càng ít lặp lại
    # - Nên đặt là 64 để giảm lặp lại
    repeat_last_n=64,
    
    # repeat_penalty: mức phạt cho việc lặp lại token
    # - Giá trị càng cao càng ít lặp lại
    # - Nên tăng lên 1.3 để giảm lặp lại nhiều hơn
    repeat_penalty=1.15
)

cache = InMemoryCache()
set_llm_cache(cache)


template = PromptTemplate.from_template(
    """
    {context}
    Tạo câu truy vấn cơ sở dữ liệu từ câu hỏi sau:
    {question}

    Trả lời ở đây:
    """
)

# nếu câu hỏi không liên quan đến các bảng cơ sở dữ liệu đã có thì trả lời là "Không liên quan đến các bảng cơ sở dữ liệu đã có", và nếu câu hỏi gây nguy hiểm đến cơ sở dữ liệu thì trả lời là "Không thể trả lời câu hỏi này"

llm_chain = (
    template |
    llm |
    StrOutputParser()
)



app = FastAPI()


from pydantic import BaseModel, Field
from typing import Optional


# Input schema for API validation
class ChatInput(BaseModel):
    context: str = Field(
        default="",
        description="Thông tin các bảng cơ sở dữ liệu đã có"
    )

    file_path: str = Field(
        default="",
        description="Đường dẫn đến file cần truy vấn"
    )

    prompt: str = Field(
        description="Câu hỏi để truy vấn cơ sở dữ liệu",
        min_length=1,
        max_length=1000,
        example="Hiển thị tất cả dữ liệu các bảng trong cơ sở dữ liệu"
    )
    
    # Optional LLM configuration parameters
    temperature: Optional[float] = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Độ sáng tạo của mô hình (0.0 - 1.0). Giá trị càng cao càng sáng tạo"
    )
    top_k: Optional[int] = Field(
        default=10,
        ge=1,
        description="Số lượng token có xác suất cao nhất được chọn"
    )
    top_p: Optional[float] = Field(
        default=0.95,
        ge=0.0,
        le=1.0,
        description="Xác suất tích lũy của các token được chọn (0.0 - 1.0)"
    )
    num_ctx: Optional[int] = Field(
        default=2048,
        ge=512,
        description="Độ dài ngữ cảnh tối đa"
    )
    num_predict: Optional[int] = Field(
        default=200,
        ge=1,
        description="Số token tối đa được sinh ra"
    )
    repeat_last_n: Optional[int] = Field(
        default=64,
        ge=0,
        description="Số token cuối cùng được xem xét để tránh lặp lại"
    )
    repeat_penalty: Optional[float] = Field(
        default=1.15,
        ge=1.0,
        description="Mức phạt cho việc lặp lại token"
    )


evaluation_validation_formater = PromptTemplate.from_template(
    """
    Chuyển đáp án: 

    {result}

    Thành dạng markdown đẹp chuẩn có thể bỏ đi các ký tự đặc biệt dư thừa, và trả lời ở đây:
    """
)

evaluation_validation_llm_chain = (
    evaluation_validation_formater |
    llm |
    StrOutputParser()
)


@app.get('/')
def home():
    return {"hello" : "World"}

@app.post('/ask')
def ask(chat_input: ChatInput):
    # name of the service is ollama-server, is hostname by bridge to connect same network
    # res = requests.post('http://ollama-server:11434/api/generate', json={
    #     "prompt": prompt,
    #     "stream" : False,
    #     "model" : "qwen2.5-coder:0.5b"
    # })
    db = SQLDatabase.from_uri(f"sqlite:///{chat_input.file_path if chat_input.file_path else path_db}")
    print("file_path: ",chat_input.file_path)


    config_kwargs = {
        "temperature": chat_input.temperature,
        "top_k": chat_input.top_k,
        "top_p": chat_input.top_p,
        "num_ctx": chat_input.num_ctx,
        "num_predict": chat_input.num_predict,
        "repeat_last_n": chat_input.repeat_last_n,
        "repeat_penalty": chat_input.repeat_penalty
        }
    
    res = llm_chain.with_config(**config_kwargs).invoke({
        "context": chat_input.context if chat_input.context else f'''Từ các bảng cơ sở dữ liệu đã có: {db.get_table_info(db.get_usable_table_names())}''',
        "question": chat_input.prompt
    })
    
    response = ""
    if isinstance(res, str):
        response = res
    else:
        response = res.text

    try:
        data_db = db.run(get_sql_from_answer_llm(response))
    except Exception as e:
        data_db = str(e)
        
    evaluation_validation_res = evaluation_validation_llm_chain.with_config(**config_kwargs).invoke({
        "context": chat_input.context if chat_input.context else f'''Từ các bảng cơ sở dữ liệu đã có: {db.get_table_info(db.get_usable_table_names())}''',
        "result": f"{data_db}"
    })
    # Store chat in database
    chat = create_chat(message=chat_input.prompt, response=evaluation_validation_res) 

    
    return {
        "answer": response, 
        "data_db": data_db,
        "evaluation": evaluation_validation_res
    }
