"use client";
import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import "remixicon/fonts/remixicon.css";
import "./page.css";
import Input from "../../components/Input/Input";
import { CodeBlock } from "../../components/ui/code-block"
import io from "socket.io-client";
import Cookies from "js-cookie";
import models from "./models";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Toaster, toast } from "sonner";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";

const Particles = dynamic(
  () => import("../../components/ui/particles"),
  { ssr: false }
);

const Page = () => {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [generatingMessage, setGeneratingMessage] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesRef = useRef();
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(Object.keys(models)[0]);
  const [selectedProvider, setSelectedProvider] = useState(
    Object.keys(models[Object.keys(models)[0]].providers)[0]
  );
  const [responseTime, setResponseTime] = useState(null);
  const startTimeRef = useRef(null);
  const [copyIndex, setCopyIndex] = useState(null);
  const router = useRouter();
  const [isWebActive, setIsWebActive] = useState(false);
  const [color, setColor] = useState("#ffffff");
  const [userId, setUserId] = useState(null);
  const [userData, setUserData] = useState({});

  const handleSetWebActive = () => {
    toast.warning("This feature is not available currently.", {position: "top-right"}); 
  }

  const calculateResponseTime = (start, end) => {
    const timeDiff = end - start;
    return (timeDiff / 1000).toFixed(1);
  };

  const handleStopGeneration = async () => {
    setIsGenerating(false);
  };

  const startTimer = () => {
    startTimeRef.current = Date.now();
  };

  function isValidImageUrl(url) {
    if (typeof url !== "string") return false;

    if (url.match(/\.(jpeg|jpg|gif|png|webp|bmp)$/i) !== null) return true;

    if (url.includes("image.pollinations.ai/prompt/")) return true;

    return false;
  }

  const stopTimer = () => {
    if (startTimeRef.current) {
      const endTime = Date.now();
      const time = calculateResponseTime(startTimeRef.current, endTime);
      startTimeRef.current = null;
      return time;
    }
    return null;
  };

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;
    setAutoScroll(isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, generatingMessage]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const newSocket = io("https://siddz-ai.onrender.com", {
        path: "/socket.io",
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to Socket.IO server on port 3001");
        setSocket(newSocket);
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket.IO connection error:", error);
      });

      return () => {
        if (newSocket) newSocket.close();
      };
    }
  }, []);

  const handleCopy = async (messageId) => {
    const messageToCopy = messages[messageId];

    if (messageToCopy) {
      try {
        await navigator.clipboard.writeText(messageToCopy.content);
        setCopyIndex(messageId);

        setTimeout(() => {
          setCopyIndex(null);
        }, 2000);
      } catch (err) {
        console.error("Failed to copy message: ", err);
      }
    } else {
      console.error("Message not found");
    }
  };

  const handleUnauthorizedAction = () => {
    router.push('/login');
    toast.error("Please login to start chatting", { position: "top-right" });
  };

  const fetchOpenAIChat = async (messages) => {
    const response = await fetch("/api/openai-proxy", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    } else {
      throw new Error(data.error?.message || "No response from OpenAI");
    }
  };

  const handleSendMessage = async (
    message,
    selectedModel,
    selectedProvider
  ) => {
    if (!userId) {
      handleUnauthorizedAction();
      return;
    }
    setIsGenerating(true);
    startTimer();

    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: message },
    ]);

    let newMessages = [
      ...messages,
      { role: "user", content: message },
    ];

    let generatedContent = "";
    try {
      const assistantReply = await fetchOpenAIChat(newMessages);
      generatedContent = assistantReply;
    } catch (error) {
      generatedContent = `Error: ${error.message}`;
    }

    setIsGenerating(false);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: generatedContent },
    ]);
    setGeneratingMessage({});
    scrollToBottom();
  };

  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const token = Cookies.get("token");
      if (!token) {
        setUserId(null);
        setUserData({});
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/verify`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );
        const data = await response.json();
        if (data.valid) {
          setUserId(data.userId);
          setUserData({
            avatar: data.avatar,
            email: data.email,
            username: data.username,
          });
        } else {
          Cookies.remove("token");
          setUserId(null);
          setUserData({});
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        Cookies.remove("token");
        setUserId(null);
        setUserData({});
      }
    };

    verifyTokenAndFetchUser();
  }, []);

  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  const handleGhibliImageUpload = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('token', Cookies.get('token'));
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/ghibli`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      
      const data = await response.json();
      toast.success('Image processed successfully in Ghibli style!');
      
      return data.imageUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      return null;
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#121212] relative">
      {/* Main Content */}
      <div className="flex-grow bg-[#121212] flex flex-col h-full">
        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Messages or Welcome section */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-grow overflow-y-auto pb-20 px-4 md:px-8"
          >
            <div className="flex flex-col h-max pt-8 w-full rounded-lg pb-20">
              <section className="flex max-w-4xl mx-auto flex-col w-full gap-6">
                {/* Welcome message */}
                <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] border border-[#383838] rounded-lg transition-all mr-auto bg-[#1e1e1e] shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <i className="ri-ai-generate text-[#4a9eff] text-lg"></i>
                      <span className="text-[#a0a0a0] font-medium">System</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-[#ff605c]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#ffbd44]"></div>
                      <div className="w-2 h-2 rounded-full bg-[#00ca4e]"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-b from-[#1e1e1e] to-[#181818]">
                    <div className="space-y-2">
                      <p className={cn(
                        "text-sm font-mono md:text-base text-[#e6e6e6]",
                        "before:content-['$'] before:text-[#4a9eff] before:mr-2"
                      )}>
                        Hello{" "}
                        {userData && userData.username
                          ? userData.username
                              .split(" ")[0]
                              .charAt(0)
                              .toUpperCase() +
                            userData.username.split(" ")[0].slice(1)
                          : "there"}! How can I assist you today?
                      </p>
                    </div>
                  </div>
                </div>

                {messages.map((message, index) => (
                  <React.Fragment key={index}>
                    {message.role === "user" ? (
                      <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] border border-[#414141] rounded-lg p-4 transition-all ml-auto bg-[#1e1e1e] shadow-lg">
                        <div className="space-y-2">
                          <p className="text-sm font-inter md:text-base text-[#e6e6e6]">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[92vw] md:max-w-[85%] rounded-lg transition-all mr-auto sm:min-w-[350px]">
                        <div className="bg-gradient-to-br from-[#1c1c1c] to-[#151515] rounded-lg shadow-lg overflow-hidden border border-[#383838] relative">
                          <div className="absolute inset-0 bg-[url('/matrix-grid.png')] opacity-[0.02] pointer-events-none"></div>
                          <div className="bg-gradient-to-r from-[#202020] to-[#181818] text-[#8e8e8e] border-b border-[#383838]">
                            <div className="flex items-center space-x-2">
                              <i className="ri-sparkling-2-line text-[#4a9eff] text-lg"></i>
                              <span className="text-[#a0a0a0] font-semibold">
                                SAGE
                              </span>
                            </div>
                          </div>
                          <div className="p-4 bg-gradient-to-b from-[#181818] to-[#151515] relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(74,158,255,0.1),transparent_70%)]"></div>
                            <div className="space-y-2 message-container relative">
                              <div className="text-sm font-mono md:text-base text-[#e2e2e2] leading-relaxed">
                                {message.content.trim().length === 0 ||
                                message.content == undefined ? (
                                  <span className="text-[#ef4444]">
                                    Error: No response received. Please try with
                                    a different model.
                                  </span>
                                ) : isValidImageUrl(message.content) ? (
                                  <img
                                    src={message.content}
                                    alt="Generated Image"
                                    className="w-full md:max-w-[24rem] rounded-lg"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = "/placeholder-image.png";
                                    }}
                                  />
                                ) : (
                                  <ReactMarkdown
                                    remarkPlugins={[remarkGfm]}
                                    components={{
                                      code({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                      }) {
                                        const match = /language-(\w+)/.exec(
                                          className || ""
                                        );
                                        return !inline && match ? (
                                          <CodeBlock
                                            language={match[1]}
                                            filename={`${match[1].charAt(0).toUpperCase() + match[1].slice(1)} Code`}
                                            code={String(children).replace(/\n$/, "")}
                                          />
                                        ) : (
                                          <code
                                            className={className}
                                            {...props}
                                          >
                                            {children}
                                          </code>
                                        );
                                      },
                                    }}
                                    className="zenos-markdown-content"
                                  >
                                    {message.content}
                                  </ReactMarkdown>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Copy button */}
                    {message.role === "assistant" && (
                      <button
                        onClick={() => handleCopy(index)}
                        className="animate-in group cursor-pointer p-1.5 flex items-center w-fit -mt-4 bg-[#202020] rounded-md border border-[#383838] hover:bg-[#252525] transition-all"
                      >
                        <i
                          className={`${
                            index == copyIndex
                              ? "ri-check-fill"
                              : "ri-file-copy-line"
                          } text-[#8e8e8e] group-hover:text-[#c1c1c1] transition-all`}
                        ></i>
                        <span className="text-xs md:text-sm ml-1.5 text-[#8e8e8e] group-hover:text-[#c1c1c1] transition-all">
                          Copy
                        </span>
                      </button>
                    )}
                  </React.Fragment>
                ))}

                {isGenerating && (
                  <div className="animate-in slide-in-from-bottom-5 duration-300 ease-out relative max-w-[95%] md:max-w-[85%] rounded-lg transition-all mr-auto">
                    <div className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-lg shadow-lg overflow-hidden border border-[#3a3a3a]">
                      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                          <span className="text-[#8e8e8e] font-semibold">
                            Generating...
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-b from-[#212121] to-[#1a1a1a]">
                        <div className="space-y-2 message-container">
                          <div className="text-sm font-inter md:text-base text-[#e2e2e2] leading-relaxed">
                            {Object.keys(generatingMessage).length === 0 ||
                            generatingMessage.content === "" ? (
                              <div className="blinking-cursor">|</div>
                            ) : (
                              generatingMessage.content
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedModel === 'ghibli' && (
                  <div className="p-4 bg-[#1a1a1a] rounded-lg">
                    <h3 className="text-lg font-medium mb-2">Upload an image for Ghibli Style generation</h3>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          toast.info('Processing image in Ghibli style...', { duration: 5000 });
                          const imageUrl = await handleGhibliImageUpload(file);
                          if (imageUrl) {
                            const message = `Here's your image in Ghibli style: ![Ghibli Image](${imageUrl})`;
                            handleSendMessage(message);
                          }
                        }
                      }}
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#333] file:text-white hover:file:bg-[#444]"
                    />
                    <p className="text-xs text-gray-400 mt-2">Supported formats: JPG, PNG, GIF (max 10MB)</p>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </section>
            </div>
          </div>

          {/* Input Section */}
          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 bg-[#121212] z-20">
            <Input
              handleSendMessage={handleSendMessage}
              models={models}
              selectedModel={selectedModel}
              setSelectedModel={setSelectedModel}
              selectedProvider={selectedProvider}
              setSelectedProvider={setSelectedProvider}
              isGenerating={isGenerating}
              handleStopGeneration={handleStopGeneration}
              isWebActive={isWebActive}
              handleSetWebActive={handleSetWebActive}
              isAuthorized={!!userId}
            />
          </div>
        </div>
      </div>

      <Toaster richColors theme="dark" />
      <Particles
        className="absolute inset-0"
        quantity={70}
        ease={80}
        color={color}
        refresh
      />
    </div>
  );
};

export default Page;
