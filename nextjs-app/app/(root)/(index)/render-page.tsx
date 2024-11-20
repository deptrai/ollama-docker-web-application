"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { askChatBot } from "@/lib/actions/chat-bot.action";
import { fadeAnimations } from "@/components/ui/framer-motion";
import MarkdownRenderer from "@/components/md";
import { Button } from "@/components/ui/button";
import { CardTitle, CardDescription, Card, CardHeader, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { MessageSquare, Settings, Trash2, Send, Bot, Brain, Thermometer, Key, Hash, Repeat, Database, FileText, Layers, Gauge, HelpCircle } from 'lucide-react';
import { FileUpload } from "@/components/upload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  evaluation?: string;
  data_db?: any;
}

type ModelConfig = {
  temperature: number; // Độ sáng tạo của câu trả lời (0-1)
  top_k: number; // Số lượng token có xác suất cao nhất được chọn
  top_p: number; // Ngưỡng xác suất tích lũy cho việc chọn token
  num_ctx: number; // Độ dài cửa sổ ngữ cảnh (tokens)
  num_predict: number; // Số lượng token tối đa cho mỗi dự đoán
  repeat_last_n: number; // Số token cuối cùng để kiểm tra lặp lại
  repeat_penalty: number; // Mức độ phạt cho việc lặp lại từ/cụm từ
}

const ModelParamTooltip = ({ label, description }: { label: string, description: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{description}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      {...fadeAnimations.withScale}
    >
      <Card className={`max-w-[85%] md:max-w-[75%] ${isUser ? 'bg-primary/10' : 'bg-background'}`}>
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
          {isUser ? <MessageSquare className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary" />}
          <CardTitle className="text-sm font-medium">{isUser ? "Bạn" : "Trợ lý"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <MarkdownRenderer content={message.content} />
          </div>
          {message.evaluation && (
            <div className="mt-4 pt-2 border-t">
              <MarkdownRenderer 
                content={`## Đánh giá đáp án trả về từ LLM Chain: \n${message.evaluation}`}
                className="p-0 border-0 shadow-none"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface ConfigSidebarProps {
  modelConfig: ModelConfig;
  setModelConfig: React.Dispatch<React.SetStateAction<ModelConfig>>;
  setMessages: (messages: ChatMessage[]) => void;
  setFilePath: (path: string) => void;
  context: string;
  setContext: (context: string) => void;
}

const ConfigSidebar = ({ modelConfig, setModelConfig, setMessages, setFilePath, context, setContext }: ConfigSidebarProps) => {
  const sidebarItems = [
    {
      title: "Xóa cuộc trò chuyện",
      icon: Trash2,
      action: (setMessages: (messages: ChatMessage[]) => void) => () => setMessages([])
    }
  ];

  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const filePath = `./uploads/${file.name}`;
      setFilePath(filePath);
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="py-6 md:py-8 lg:py-10">
            <div className="flex items-center gap-3 px-4">
              <Bot className="w-8 h-8 text-primary" />
              <div>
                <CardTitle>NL2SQL Assistant</CardTitle>
                <CardDescription>Chuyển đổi ngôn ngữ tự nhiên sang SQL</CardDescription>
              </div>
            </div>
          </SidebarGroupLabel>
          
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  onClick={item.action(setMessages)}
                  className="hover:bg-destructive/10 transition-colors"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Dữ liệu</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4" />
                  Context
                  <ModelParamTooltip 
                    label="Context"
                    description="Thông tin về schema và dữ liệu mẫu của database"
                  />
                </label>
                <Textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Nhập context cho mô hình..."
                  className="min-h-[100px] resize-y focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  File Database
                  <ModelParamTooltip 
                    label="File Database"
                    description="Upload file chứa schema và dữ liệu mẫu"
                  />
                </label>
                <FileUpload onChange={handleFileUpload} />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Cấu hình mô hình</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-6">
              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4" />
                    Temperature
                    <ModelParamTooltip 
                      label="Temperature"
                      description="Điều chỉnh độ sáng tạo trong câu trả lời. Giá trị cao hơn cho kết quả đa dạng hơn, thấp hơn cho kết quả nhất quán hơn."
                    />
                  </span>
                  <span className="font-mono">{modelConfig.temperature}</span>
                </label>
                <Slider 
                  value={[modelConfig.temperature]}
                  min={0}
                  max={1}
                  step={0.1}
                  onValueChange={([value]) => setModelConfig(prev => ({...prev, temperature: value}))}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Key className="w-4 h-4" />
                    Top K
                    <ModelParamTooltip 
                      label="Top K"
                      description="Số lượng token có xác suất cao nhất được xem xét cho mỗi bước dự đoán."
                    />
                  </span>
                  <span className="font-mono">{modelConfig.top_k}</span>
                </label>
                <Slider
                  value={[modelConfig.top_k]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([value]) => setModelConfig(prev => ({...prev, top_k: value}))}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Top P
                    <ModelParamTooltip 
                      label="Top P"
                      description="Ngưỡng xác suất tích lũy cho nucleus sampling. Giá trị thấp hơn tạo ra văn bản tập trung hơn."
                    />
                  </span>
                  <span className="font-mono">{modelConfig.top_p}</span>
                </label>
                <Slider
                  value={[modelConfig.top_p]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([value]) => setModelConfig(prev => ({...prev, top_p: value}))}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Hash className="w-4 h-4" />
                  Context Window
                  <ModelParamTooltip 
                    label="Context Window"
                    description="Số lượng token tối đa mà mô hình có thể xử lý trong một lần. Giá trị cao hơn cho phép xử lý văn bản dài hơn."
                  />
                </label>
                <Input
                  type="number"
                  value={modelConfig.num_ctx}
                  onChange={(e) => setModelConfig(prev => ({...prev, num_ctx: parseInt(e.target.value)}))}
                  min={1024}
                  max={8192}
                  step={512}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Gauge className="w-4 h-4" />
                  Num Predict
                  <ModelParamTooltip 
                    label="Num Predict"
                    description="Số lượng token tối đa mà mô hình sẽ sinh ra trong một lần dự đoán."
                  />
                </label>
                <Input
                  type="number"
                  value={modelConfig.num_predict}
                  onChange={(e) => setModelConfig(prev => ({...prev, num_predict: parseInt(e.target.value)}))}
                  min={100}
                  max={2000}
                  step={100}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4" />
                  Repeat Last N
                  <ModelParamTooltip 
                    label="Repeat Last N"
                    description="Số token cuối cùng được xem xét khi tính toán hình phạt lặp lại."
                  />
                </label>
                <Input
                  type="number"
                  value={modelConfig.repeat_last_n}
                  onChange={(e) => setModelConfig(prev => ({...prev, repeat_last_n: parseInt(e.target.value)}))}
                  min={16}
                  max={256}
                  step={16}
                  className="font-mono"
                />
              </div>

              <div>
                <label className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2">
                    <Repeat className="w-4 h-4" />
                    Repeat Penalty
                    <ModelParamTooltip 
                      label="Repeat Penalty"
                      description="Mức độ phạt áp dụng cho việc lặp lại từ/cụm từ. Giá trị cao hơn giảm khả năng lặp lại."
                    />
                  </span>
                  <span className="font-mono">{modelConfig.repeat_penalty}</span>
                </label>
                <Slider
                  value={[modelConfig.repeat_penalty]}
                  min={1}
                  max={2}
                  step={0.05}
                  onValueChange={([value]) => setModelConfig(prev => ({...prev, repeat_penalty: value}))}
                  className="[&_[role=slider]]:h-4 [&_[role=slider]]:w-4"
                />
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

interface MainChatProps {
  messages: ChatMessage[];
  input: string;
  setInput: (input: string) => void;
  isLoading: boolean;
  progress: number;
  handleSubmit: () => void;
}

const MainChat = ({ messages, input, setInput, isLoading, progress, handleSubmit }: MainChatProps) => {
  return (
    <main className="flex-1 flex flex-col w-full min-w-0 sm:min-w-[30rem] lg:min-w-[40rem] mx-auto max-w-[80rem] h-screen">
      <header className="flex items-center p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="lg:hidden hover:bg-accent rounded-full p-2 transition-colors" />
        <div className="ml-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h2 className="font-semibold">Trò chuyện</h2>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-4">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-gray-300">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Bot className="w-12 h-12 mb-4 text-primary animate-pulse" />
              <p className="text-gray-600 font-medium">Bắt đầu cuộc trò chuyện với trợ lý SQL</p>
              <p className="text-sm text-gray-500 mt-2">Hãy mô tả nhu cầu truy vấn của bạn</p>
            </div>
          )}
          
          {messages.map((message: ChatMessage, index: number) => (
            <MessageBubble key={index} message={message} />
          ))}
          
          {isLoading && (
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4 animate-pulse" />
              <Progress value={progress} className="h-2 animate-pulse" />
            </div>
          )}
        </div>

        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Mô tả nhu cầu truy vấn SQL của bạn..."
              className="min-h-[60px] resize-none focus:ring-2 focus:ring-primary"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              variant="default"
              size="icon"
              className="shrink-0 hover:scale-105 transition-transform"
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Gửi</span>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [filePath, setFilePath] = useState("");
  const [context, setContext] = useState("");
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    temperature: 0.1,
    top_k: 10,
    top_p: 0.95,
    num_ctx: 2048,
    num_predict: 200,
    repeat_last_n: 64,
    repeat_penalty: 1.15
  });

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setProgress(30);

    try {
      const response = await askChatBot({
        prompt: input,
        context: context,
        file_path: filePath,
        ...modelConfig
      });

      setProgress(100);

      const botMessage: ChatMessage = {
        role: "assistant",
        content: response.answer,
        evaluation: response.evaluation,
        data_db: response.data_db
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content: "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn."
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setProgress(0);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden lg:block w-80 border-r">
        <ConfigSidebar 
          modelConfig={modelConfig}
          setModelConfig={setModelConfig}
          setMessages={setMessages}
          setFilePath={setFilePath}
          context={context}
          setContext={setContext}
        />
      </div>
      <MainChat
        messages={messages}
        input={input}
        setInput={setInput}
        isLoading={isLoading}
        progress={progress}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};

export default ChatInterface;
