import "./styles.css"
import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { v4 as uuidv4 } from 'uuid';
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { MdContentCopy } from "react-icons/md";
import QuillCursors from 'quill-cursors';
Quill.register('modules/cursors', QuillCursors);



const SAVE_INTERVAL_MS = 2000;

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
];

export default function TextEditor() {
  
  const { id: noteId } = useParams();

  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [title, setTitle] = useState("");
  const [showShare, setShowShare] = useState(false);
  const navigate = useNavigate();
  const [totalUser, setTotalUser] = useState(0);


  const [userId] = useState(uuidv4());
  const [cursorsModule, setCursorsModule] = useState();

  useEffect(() => {
    const s = io(process.env.REACT_APP_API_URL);
    setSocket(s);

    s.emit("join" , {userId});

    return () => {
      s.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.once("load-note", (note) => {
      quill.setContents(note.content);
      setTitle(note.title);
      quill.enable();
    });

    socket.emit("get-note", noteId);
  }, [socket, quill, noteId]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-note", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);

    socket.on("user-count", (count) => {
      setTotalUser(count);
    });

    socket.on("cursor-position", ({ userId: otherUserId, range }) => {
      if (!cursorsModule) return;
      if (otherUserId === userId) return; 
      cursorsModule.createCursor(otherUserId, "User", "red");
      cursorsModule.moveCursor(otherUserId, range);
    });


    return () => {
      socket.off("receive-changes", handler);
       socket.off("cursor-position");
    };
  }, [socket, quill , cursorsModule , userId]);



  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (range, oldRange, source) => {
      if (source !== "user") return;
      if (!range) return; 
      socket.emit("cursor-position", { userId, range });
    };

    quill.on("selection-change", handler);

    return () => {
      quill.off("selection-change", handler);
    };
  }, [socket, quill, userId]);

  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS , cursors: true  },
    });

       const cursors = q.getModule("cursors");
    setCursorsModule(cursors);


    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  

  return (
    <section className="main_section">

      <header className="header">
         <div >
          <h2>Title: {title} </h2>
          <span>Active User: {totalUser}</span>
         </div>

        <div style={{display:"flex" , alignItems:"center" , gap:"10px"}}>
             <button onClick={() => navigate("/")}>Back</button>
             <button onClick={() => setShowShare(true)}>Share</button>
        </div>
      </header>

      <main>
        <div className="container" ref={wrapperRef}></div>
      </main>


      {showShare && (
  <div className="backdrop">
    <div className="modal">
      <h3>Share this Room</h3>
      <div className="url-box">
        <input
          type="text"
          readOnly
          disabled
          value={window.location.href}
        />
        <button style={{border:"none" , background:"none" , cursor:"pointer"}}
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            alert("Copied to clipboard!");
          }}
        >
          <MdContentCopy />
        </button>
      </div>
      <button className="close" onClick={() => setShowShare(false)}>
        Close
      </button>
    </div>
  </div>
)}

    </section>
  );
}
