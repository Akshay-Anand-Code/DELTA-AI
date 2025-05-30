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
import { useParams, usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { Toaster, toast } from "sonner";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import SolanaAddressButton from "../../components/ui/solana-address-button";

const Particles = dynamic(
  () => import("../../components/ui/particles"),
  { ssr: false }
);

// ====== OPENAI API KEY REMOVED FROM FRONTEND ======
// =================================================

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [generatingMessage, setGeneratingMessage] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [socket, setSocket] = useState(null);
  const messagesRef = useRef();
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState(Object.keys(models)[1]);
  const [selectedProvider, setSelectedProvider] = useState(
    Object.keys(models[Object.keys(models)[0]].providers)[0]
  );
  const [responseTime, setResponseTime] = useState(null);
  const startTimeRef = useRef(null);
  const [timeMetaData, setTimeMetaData] = useState({});
  const [messageMetadata, setMessageMetadata] = useState({});
  const latestMetadataRef = useRef(messageMetadata);
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [chatData, setChatData] = useState([]);
  const [animatedTitle, setAnimatedTitle] = useState("");
  const latestChatIdRef = useRef(null);
  const [userData, setUserData] = useState({});
  const [copyIndex, setCopyIndex] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isToggling, setIsToggling] = useState(false);
  const [isWebActive, setIsWebActive] = useState(false);
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    const chatIdFromUrl = params?.chatId || pathname.split("/").pop();
    if (chatIdFromUrl && chatIdFromUrl !== "chat") {
      setChatId(chatIdFromUrl);
      fetchSpecificChat(chatIdFromUrl);
    }
  }, []);

  const handleSetWebActive = () => {
    // setIsWebActive(!isWebActive);
    toast.warning("This feature is not available currently.", {position: "top-right"}); 
  }

  useEffect(() => {
    latestChatIdRef.current = chatId;
  }, [chatId]);

  const calculateResponseTime = (start, end) => {
    const timeDiff = end - start;
    return (timeDiff / 1000).toFixed(1); // Convert to seconds and round to 1 decimal place
  };

  const fetchAndCategorizeChats = async (userId) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchchats/${userId}`
      );
      const data = await response.json();

      if (data.chats) {
        let updatedChats = [...data.chats];

        if (!mounted) {
          const newChatEntry = {
            id: `temp`,
            title: "New chat",
          };

          const recentCategoryIndex = updatedChats.findIndex(
            (category) => category.category === "Recent"
          );

          if (recentCategoryIndex !== -1) {
            updatedChats[recentCategoryIndex].chats.unshift(newChatEntry);
          } else {
            updatedChats.unshift({
              category: "Recent",
              chats: [newChatEntry],
            });
          }
        }

        setChatData(updatedChats);
        // console.log("Fetched and categorized chats:", data);
      } else {
        console.error("No chats data received from the server");
        setChatData([]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setChatData([]);
    }
  };

  const newChat = async () => {
    setChatId(null);
    setMessages([]);
    window.history.pushState({}, "", `/chat`);

    const newChatEntry = {
      id: "temp",
      title: "New chat",
    };

    // Update the chatData state
    setChatData((prevChatData) => {
      let updatedChats = [...prevChatData];
      const recentCategoryIndex = updatedChats.findIndex(
        (category) => category.category === "Recent"
      );

      if (recentCategoryIndex !== -1) {
        const newChatExists = updatedChats[recentCategoryIndex].chats.some(
          (chat) => chat.id === "temp" && chat.title === "New chat"
        );

        if (!newChatExists) {
          updatedChats[recentCategoryIndex].chats.unshift(newChatEntry);
        }
      } else {
        updatedChats.unshift({
          category: "Recent",
          chats: [newChatEntry],
        });
      }

      console.log(updatedChats);
      return updatedChats;
    });

    if (isMobile) {
      toggleSidebar();
    }
  };

  const handleStopGeneration = async () => {
    setIsGenerating(false);
  };

  const fetchSpecificChat = async (chatId) => {
    if (chatId === latestChatIdRef.current) {
      return; // Don't fetch if it's the same chat
    }

    if (chatId === "temp") {
      newChat();
      if (isMobile) {
        toggleSidebar();
      }
      window.history.pushState({}, "", `/chat`);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/fetchchat/${chatId}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch chat");
      }
      const data = await response.json();

      if (data) {
        setMessages(data.messages || []);
        console.log(data.messages);
        setChatId(chatId);
        latestChatIdRef.current = chatId;

        // Update URL without full page reload
        window.history.pushState({}, "", `/chat/${chatId}`);

        if (data.metaData) {
          setMessageMetadata(data.metaData);
        }
        if (data.timeData) {
          setTimeMetaData(data.timeData);
        }
      } else {
        console.error("No chat data received from the server");
      }
    } catch (error) {
      console.error("Error fetching specific chat:", error);
    }
  };

  useEffect(() => {
    latestMetadataRef.current = messageMetadata;
  }, [messageMetadata]);

  useEffect(() => {
    const verifyTokenAndFetchChats = async () => {
      const token = Cookies.get("token");
      if (!token) {
        // Instead of redirecting, set a guest state
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

          await fetchAndCategorizeChats(data.userId);
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

    verifyTokenAndFetchChats();
  }, []);

  useEffect(() => {
    if (chatData.length > 0 && chatData[0].chats.length > 0) {
      const firstChatTitle = chatData[0].chats[0].title;
      let index = 0;

      setAnimatedTitle(""); // Reset the animated title

      const animateTitle = () => {
        if (index < firstChatTitle.length) {
          setAnimatedTitle(firstChatTitle.slice(0, index + 1));
          index++;
          setTimeout(animateTitle, 50);
        }
      };

      animateTitle();

      return () => {
        // No need to clear interval as we're using setTimeout
      };
    }
  }, [chatData]);

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

      setTimeMetaData((prevTimeMetaData) => {
        const newMessageIndex = messages.length + 1;
        return {
          ...prevTimeMetaData,
          [newMessageIndex]: time,
        };
      });

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
    // Ensure this runs only on the client side
    if (typeof window !== "undefined") {
      const newSocket = io("https://siddz-ai.onrender.com", {
        // const newSocket = io("http://localhost:3001", {
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
        model: "gpt-4o", // Always use OpenAI GPT-4o
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

  useLayoutEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    checkScreenSize();
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsSidebarOpen(!mobile);
    };

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setIsToggling(true);
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleGhibliImageUpload = async (file) => {
    if (!file) return null;
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('token', Cookies.get('token'));
      
      // Use the direct Ghibli processing endpoint
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/ghibli`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process image');
      }
      
      const data = await response.json();
      toast.success('Image processed successfully in Ghibli style!');
      
      // The processed image URL is returned directly
      return data.imageUrl;
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image');
      return null;
    }
  };

  return (
    <div className="flex w-full h-screen bg-[#121212] relative">
      <div
        className={`
          h-full bg-[#212121] w-[17.5rem] flex-shrink-0 flex flex-col
          ${isToggling ? "transition-all duration-300 ease-in-out" : ""}
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          ${isMobile ? "fixed left-0 top-0 z-40" : ""}
        `}
      >
        <div className="px-2 py-3">
          <div className="flex items-center justify-between sm:mb-6 mb-2">
            <button
              className="md:hidden text-white p-2"
              onClick={toggleSidebar}
            >
              <i
                className={`ri-${
                  isSidebarOpen ? "close" : "menu"
                }-line text-2xl`}
              ></i>
            </button>
            <div className="flex items-center">
              <img src="/logo.png" alt="DELTA VISION Logo" className="sm:h-9 sm:w-9 xss:h-4 xss:w-5 rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm" />
              <h1
                className={`font-semibold hidden md:block  px-2.5 font-inter text-xl`}
              >
                DELTA VISION
              </h1>
            </div>
          </div>
          <button
            onClick={() => newChat()}
            className="font-medium flex items-center space-x-2 w-full hover:bg-[#383838] px-2.5 py-1 rounded-lg transition-all"
          >
            <i className="ri-chat-new-line text-[#e2e2e2] text-xl"></i>
            <span className="text-[#e2e2e2] font-medium">New Chat</span>
          </button>
        </div>
        <div className="flex-1 overflow-hidden border-t border-[#414141]">
          <div className="h-full overflow-y-auto px-2 py-3">
            {chatData.map(({ category, chats }, categoryIndex) => (
              <div key={category} className="mb-4">
                <h6 className="text-[#8e8e8e] text-xs font-medium mb-2 px-2.5 tracking-wider">
                  {category}
                </h6>
                {chats.map((chat, chatIndex) => (
                  <button
                    key={chat.id}
                    // href={`/chat/${chat.id}`}
                    onClick={() => fetchSpecificChat(chat.id)}
                    className="w-full mb-0.5 text-left px-2.5 py-1.5 rounded-lg 
                         hover:bg-gradient-to-r hover:from-[#383838] hover:to-[#2a2a2a] 
                         transition-all duration-300 ease-in-out 
                         group relative overflow-hidden"
                  >
                    <span
                      className="text-[#e6e6e6] group-hover:text-white text-[0.96rem] whitespace-nowrap overflow-hidden text-ellipsis block
                           transition-colors duration-300"
                    >
                      {categoryIndex === 0 && chatIndex === 0
                        ? animatedTitle
                        : chat.title}
                    </span>
                    <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[#212121] group-hover:from-[#2a2a2a] to-transparent"></div>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="h-[6rem] flex items-center justify-between px-2 py-1.5 border-t border-[#414141]">
          {userId ? (
            <div className="flex-1 px-2 py-1.5 rounded-xl hover:bg-[#2c2c2c] transition-all cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-[#e2e2e2] font-semibold text-sm">
                      {userData.username}
                    </h3>
                    <h5 className="text-[#8e8e8e] text-xs">{userData.email}</h5>
                  </div>
                </div>
                <button className="text-[#8e8e8e] hover:text-[#e2e2e2] transition-colors">
                  <i className="ri-settings-3-line text-xl"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 px-2">
              <button
                onClick={() => router.push('/login')}
                className="w-full py-2 bg-[#2c2c2c] hover:bg-[#383838] text-[#e2e2e2] rounded-lg transition-all flex items-center justify-center space-x-2"
              >
                <i className="ri-login-box-line"></i>
                <span>Login to Chat</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow bg-[#121212] flex flex-col h-full">
        {/* Mobile header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-10 flex items-center justify-between bg-[#121212] h-16 px-4">
          <button className="text-white p-2" onClick={toggleSidebar}>
            <i className="ri-menu-line text-2xl"></i>
          </button>
          <h1 className="font-semibold text-[#c69326] font-mono text-xl">
            Delta Vision
          </h1>
          <button className="text-white p-2">
            <i className="ri-chat-new-line text-2xl"></i>
          </button>
        </div>

        <div className="flex flex-col flex-grow overflow-hidden">
          {/* Messages or Welcome section */}
          <div
            ref={messagesRef}
            onScroll={handleScroll}
            className="flex-grow overflow-y-auto pb-20 md:pb-0 px-4 md:px-8"
          >
            <div className="flex flex-col h-max pt-20 w-full rounded-lg pb-20">
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
                              {messageMetadata[index] ? (
                                <>
                                  <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                                  {messageMetadata[index] &&
                                    (messageMetadata[index].model ||
                                      messageMetadata[index].provider) && (
                                      <div className="metadata space-x-2">
                                        {messageMetadata[index].model && (
                                          <span className="text-[#a0a0a0] font-semibold">
                                            {messageMetadata[index].model}
                                          </span>
                                        )}
                                        {messageMetadata[index].provider && (
                                          <span className="text-[#8e8e8e] text-xs">
                                            with{" "}
                                            {messageMetadata[index].provider}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                </>
                              ) : (
                                <>
                                  <i className="ri-error-warning-line text-yellow-500 text-lg"></i>
                                  <span className="text-[#a0a0a0]  font-semibold">
                                    Error
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[#8e8e8e] text-xs">
                                Time: {timeMetaData[index]}s
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
                      {/* Model information */}
                      <div className="bg-gradient-to-r from-[#2a2a2a] to-[#252525] text-[#8e8e8e] text-xs font-medium py-2 px-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <i className="ri-ai-generate text-[#c69326] text-lg"></i>
                          {messageMetadata[messages.length] &&
                          (messageMetadata[messages.length].model ||
                            messageMetadata[messages.length].provider) ? (
                            <div className="metadata space-x-2">
                              {messageMetadata[messages.length].model && (
                                <span className="text-[#a0a0a0] font-semibold">
                                  {messageMetadata[messages.length].model}
                                </span>
                              )}
                              {messageMetadata[messages.length].provider && (
                                <span className="text-[#8e8e8e] text-xs">
                                  with{" "}
                                  {messageMetadata[messages.length].provider}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#8e8e8e] font-semibold">
                              Generating...
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Response content */}
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
                            // Add the processed image directly to the chat
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
          <div className="flex-shrink-0 fixed bottom-0 left-0 right-0 md:relative bg-[#121212]">
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

      {/* Overlay for mobile */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={toggleSidebar}
        ></div>
      )}
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
