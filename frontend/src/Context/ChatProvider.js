
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  initialState
} from "react";
import { useHistory } from "react-router-dom";

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedChat,setSelectedChat]=useState(null)
  const [chats,setChats]=useState([])
  const [notification,setNotification]=useState([]);
  const history = useHistory(); // ✅ define history


  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setUser(userInfo);

    if (!userInfo) {
      history.push("/"); // redirect to home if not logged in
    }
  }, []); // ✅ NO history dependency

  return (
    <ChatContext.Provider value={{ user, setUser,selectedChat,setSelectedChat,chats,setChats,notification,setNotification}}>
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
