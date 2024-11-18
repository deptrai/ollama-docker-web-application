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

# Langchain
from langchain_ollama import OllamaLLM # Ollama model
from langchain_ollama.llms import BaseLLM # Lớp cơ sở của LLM
from langchain.chains.llm import LLMChain # xử lí chuỗi các LLM
from langchain.chains.sql_database.query import create_sql_query_chain # tạo câu truy vấn cơ sở dữ liệu từ llm
from langchain.prompts import PromptTemplate # tạo câu truy vấn từ mẫu
from langchain_community.tools import QuerySQLDataBaseTool # công cụ truy vấn cơ sở dữ liệu
from langchain.sql_database import SQLDatabase # cơ sở dữ liệu
from langchain_core.output_parsers import StrOutputParser, PydanticOutputParser # xử lí kết quả trả về là kiểu dữ liệu chuỗi
from langchain_core.runnables import RunnablePassthrough # truyền đa dạng đối số
from operator import itemgetter # lấy giá trị từ dict
# Cache
from langchain.cache import InMemoryCache
from langchain.globals import set_llm_cache
#--------------------------------------------------

# Utility
from utils import get_sql_from_answer_llm

#test on docker
url_docker = "http://ollama-server:11434"
#test on local
url_local = "http://localhost:11434"
model = "qwen2.5-coder:0.5b"

llm = OllamaLLM(
    base_url=url_local, 
    model=model
)

cache = InMemoryCache()
set_llm_cache(cache)


template = PromptTemplate.from_template(
    """
    Từ các bảng cơ sở dữ đã có: {tables}
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

db = SQLDatabase.from_uri(f"sqlite:///{path_db}")


app = FastAPI()




@app.get('/')
def home():
    return {"hello" : "World"}

@app.get('/ask')
def ask(prompt :str):
    # name of the service is ollama-server, is hostname by bridge to connect same network
    # res = requests.post('http://ollama-server:11434/api/generate', json={
    #     "prompt": prompt,
    #     "stream" : False,
    #     "model" : "qwen2.5-coder:0.5b"
    # })

    res = llm_chain.invoke({
        "tables": f'''{db.get_table_info(db.get_usable_table_names())}''',
        "question": prompt
    })
    
    response = ""
    if isinstance(res, str):
        response = res
    else:
        response = res.text
        
    # Store chat in database
    chat = create_chat(message=prompt, response=response)

    try:
        data_db = db.run(get_sql_from_answer_llm(response))
    except Exception as e:
        data_db = str(e)
    
    return {
        "answer": response, 
        "data_db": data_db
    }
