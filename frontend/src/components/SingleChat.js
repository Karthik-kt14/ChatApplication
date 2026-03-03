
import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Text,
  IconButton,
  Spinner,
  FormControl,
  Input,
  useToast,
} from "@chakra-ui/react";
import { ArrowBackIcon } from "@chakra-ui/icons";
import axios from "axios";
import io from "socket.io-client";
import Lottie from "react-lottie"
import { ChatState } from "../Context/ChatProvider";
import animationData from "../animations/typing.json"
import ScrollableChat from "./ScrollableChat";
import { getSender, getSenderFull } from "../config/ChatLogics";
import ProfileModal from "./Authentication/miscellaneous/ProfileModal";
import UpdateGroupChatModal from "./Authentication/miscellaneous/UpdateGroupChatModal";

import "./styles.css";

const ENDPOINT = "http://localhost:5000";
let socket;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const { user, selectedChat, setSelectedChat ,notification,setNotification} = ChatState();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing,setTyping]=useState(false);
  const [isTyping,setIsTyping]=useState(false);
 // const {user,selectedChat,setSelectedChat,notification,setNotification}=ChatState();
  const defaultOptions = {
  loop: true,
  autoplay: true,
  animationData: animationData,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid slice",
  },
};
  const [socketConnected, setSocketConnected] = useState(false);

  const selectedChatCompare = useRef(null);
  const lastTypingTimeRef = useRef(null);

  const toast = useToast();

  // 🔌 SOCKET SETUP
//   useEffect(() => {
//     socket = io(ENDPOINT);
//     socket.emit("setup", user);

//     socket.on("connected", () => {
//       setSocketConnected(true);
//     });
//     socket.on("typing", () => setIsTyping(true));
// socket.on("stop_typing", () => setIsTyping(false));
//     return () => {
//       socket.disconnect();
//     };
//   }, [user]);
useEffect(() => {
  socket = io(
    process.env.NODE_ENV === "production"
      ? "/"
      : "http://localhost:5000"
  );

  socket.emit("setup", user);

  socket.on("connected", () => {
    setSocketConnected(true);
  });

  socket.on("typing", () => setIsTyping(true));
  socket.on("stop typing", () => setIsTyping(false));

  return () => {
    socket.disconnect();
  };
}, [user]);
  console.log(notification,"----------------")
  // 📩 RECEIVE MESSAGE (REAL-TIME)
  useEffect(() => {
    if (!socket) return;

    socket.on("message received", (newMessageReceived) => {
         setIsTyping(false); 
      if (
        !selectedChatCompare.current ||
        selectedChatCompare.current._id !== newMessageReceived.chat._id
      ) {
        // notification logic later
        if (!notification.includes(newMessageReceived)) {
  setNotification([newMessageReceived, ...notification]);
  setFetchAgain(!fetchAgain);
}
      } else {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, []);

  // 📥 FETCH MESSAGES WHEN CHAT CHANGES
 // useEffect(() => {
   // if (!selectedChat) return;

//     const fetchMessages = async () => {
//       try {
//         const config = {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         };

//         setLoading(true);

//         socket.emit("join chat", selectedChat._id);

//         const { data } = await axios.get(
//           `/api/message/${selectedChat._id}`,
//           config
//         );

//         setMessages(data);
//         setLoading(false);
//         selectedChatCompare.current = selectedChat;
//       } catch (error) {
//         toast({
//           title: "Error Occurred!",
//           description: "Failed to load messages",
//           status: "error",
//           duration: 5000,
//           isClosable: true,
//           position: "bottom",
//         });
//       }
//     };

//     fetchMessages();
//   }, [selectedChat, user, toast]);
useEffect(() => {
  if (!selectedChat) return;

  const fetchMessages = async () => {
    setLoading(true);

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      socket.emit("join chat", selectedChat._id);

      const { data } = await axios.get(
        `/api/message/${selectedChat._id}`,
        config
      );

      setMessages(data);
      selectedChatCompare.current = selectedChat;
    } catch (error) {
      toast({
        title: "Error Occurred!",
        description: "Failed to load messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    } finally {
      // 🔥 GUARANTEED cleanup
      setLoading(false);
    }
  };

  fetchMessages();
}, [selectedChat, user, toast]);
useEffect(() => {
  setIsTyping(false);
  setTyping(false);
}, [selectedChat]);



//   const typingHandler = (e) => {
//   setNewMessage(e.target.value);

//   // Typing Indicator Logic
//   if (!socketConnected) return;

//   if (!typing) {
//     setTyping(true);
//     socket.emit("typing", selectedChat._id);
//   }

//   let lastTypingTime = new Date().getTime();
//   var timerLength = 3000;

//   setTimeout(() => {
//     var timeNow = new Date().getTime();
//     var timeDiff = timeNow - lastTypingTime;

//     if (timeDiff >= timerLength && typing) {
//       socket.emit("stop_typing", selectedChat._id);
//       setTyping(false);
//     }
//   }, timerLength);
// };
const typingHandler = (e) => {
  const value = e.target.value;
  setNewMessage(value);

  if (!socketConnected) return;

  if (value === "") {
    socket.emit("stop_typing", selectedChat._id);
    setTyping(false);
    return;
  }

  if (!typing) {
    setTyping(true);
    socket.emit("typing", selectedChat._id);
  }

  lastTypingTimeRef.current = new Date().getTime();

  setTimeout(() => {
    const timeNow = new Date().getTime();
    const timeDiff = timeNow - lastTypingTimeRef.current;

    if (timeDiff >= 3000 && typing) {
      socket.emit("stop_typing", selectedChat._id);
      setTyping(false);
    }
  }, 3000);
};


  // ✉️ SEND MESSAGE
  const sendMessage = async (e) => {
    if (e.key === "Enter" && newMessage.trim()) {
        socket.emit("stop_typing",selectedChat._id);
         setTyping(false);                              
    setIsTyping(false);   
      try {
        const config = {
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        };

        setNewMessage("");

        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          config
        );

        socket.emit("new message", data);
        setMessages((prev) => [...prev, data]);
      } catch (error) {
        toast({
          title: "Error Occurred!",
          description: "Failed to send the message",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom",
        });
      }
    }
  };

  return (
    <>
      {selectedChat ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />

            {!selectedChat.isGroupChat ? (
              <>
                {getSender(user, selectedChat.users)}
                <ProfileModal
                  user={getSenderFull(user, selectedChat.users)}
                />
              </>
            ) : (
              <>
                {selectedChat.chatName.toUpperCase()}
                <UpdateGroupChatModal
                  fetchAgain={fetchAgain}
                  setFetchAgain={setFetchAgain}
                />
              </>
            )}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner size="xl" alignSelf="center" margin="auto" />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

            <FormControl onKeyDown={sendMessage} mt={3} isRequired>
                {/* {isTyping?<div>Loading...</div> : <></>} */}
                {isTyping ?<div><Lottie
                options={defaultOptions}
width={70}
style={{ marginBottom: 15, marginLeft: 0 }}
/>
</div> : <></>}
              <Input
  variant="filled"
  bg="#E0E0E0"
  placeholder="Enter a message..."
  value={newMessage}
  onChange={typingHandler}
/>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          h="100%"
        >
          <Text fontSize="3xl" fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
