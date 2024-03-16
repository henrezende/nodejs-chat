"use client";
import { useState, useEffect } from "react";
import io, { Socket } from "socket.io-client";

export default function Home() {
  const [messages, setMessages] = useState<
    { username: string; text: string; timestamp: string }[]
  >([]);
  const [inputText, setInputText] = useState("");
  const [username, setUsername] = useState("");
  const [userList, setUserList] = useState([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const getUsernameAndConnect = async () => {
      const username = prompt("Digite seu nome:");
      if (!username) return;
      setUsername(username);
      const socketWithUser = io("http://localhost:3000", {
        query: { username },
      });

      socketWithUser.on("userListUpdate", (updatedUserList) => {
        setUserList(updatedUserList);
      });

      socketWithUser.on("message", (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      setSocket(socketWithUser);

      return () => {
        socketWithUser.disconnect();
      };
    };

    getUsernameAndConnect();
  }, []);

  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const message = {
      username,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
    };
    socket?.emit("message", message);
    setInputText("");
  };

  const isMessageFromCurrentUser = (message) => {
    return message.username === username;
  };

  return (
    <div
      className={
        "flex flex-col drop-shadow-2xl rounded-lg justify-end h-full bg-violet-800 p-8"
      }
    >
      <div className={"flex h-full"}>
        <div className={"flex flex-col w-3/4 p-4 m-6 overflow-auto"}>
          {messages.map((message, index) =>
            isMessageFromCurrentUser(message) ? (
              <div
                key={index}
                className={
                  "p-2 bg-slate-200 rounded-lg my-2 w-fit self-end flex-col flex"
                }
              >
                <strong>Você: </strong>
                {message.text}
              </div>
            ) : (
              <div
                key={index}
                className={
                  "p-2 bg-violet-400 rounded-lg my-2 w-fit flex-col flex"
                }
              >
                <strong>{message.username}: </strong>
                {message.text}
              </div>
            )
          )}
        </div>

        <div
          className={"flex flex-col w-1/4 bg-slate-200 rounded-lg my-8 pr-2"}
        >
          <h2 className={"font-bold text-violet-900 p-4"}>
            Usuários conectados
          </h2>
          <div className={"px-4 pb-4 h-full w-full overflow-auto "}>
            <ul>
              {userList.map((user, index) => (
                <li key={index} className={"font-medium"}>
                  {user}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className={"flex w-full"}>
        <input
          className={"w-3/4 rounded-md p-2 drop-shadow-lg"}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Digite uma mensagem..."
        />
        <button
          className={
            "w-1/4 bg-violet-400 text-violet-800 font-bold p-2 ml-4 drop-shadow-lg rounded-lg"
          }
          onClick={sendMessage}
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
