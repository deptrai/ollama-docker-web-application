#!/bin/sh

# Pull the Qwen model
ollama pull qwen2.5-coder:0.5b

# Start Ollama server
ollama serve
