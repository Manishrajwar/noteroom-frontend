import "./page.css"
import { useEffect, useState } from "react";
import axios from "axios"
import { useNavigate } from "react-router-dom";
import { DocumentEndpoints } from "../services/apis";
import toast from "react-hot-toast";
import NotesGrid from "../Component/NotesGrid";

function HomePage() {

    const [title , setTitle] = useState("");
    const navigate = useNavigate();
    const  [loading, setLoading] = useState(false);
    const [allNotes, setAllNotes] = useState([]);

    const CreateDocumentHandler = async()=>{

         if(title === ""){
            return toast.error("title is required");
         }

          const toastId = toast.loading("Loading...");
          setLoading(true);

         try{
                 let payload = {
                    title: title , 
                      content:'' , 
                 }

            const resp = await axios.post(DocumentEndpoints.CREATE_NOTE_ROOM ,payload );

             if(resp.data?.status){
                 toast.success("successfuly Created");
                 setTimeout(() => {
                   navigate(`/notes/${resp.data.id}`);
                   setLoading(false);
                 }, 2000);
             }

         } catch(error){
             console.log("error",error);
             toast.error("Something went wrong, Please refresh the page");
             setLoading(false);
         } finally{
          toast.dismiss(toastId);
         }
    }  

    const fetchAllNotes = async()=>{
      try{

        const resp = await axios.get(DocumentEndpoints.GET_ALL_NOTE_ROOMS);

         if(resp.data.status){
           setAllNotes(resp.data.allNotes);
         }

      } catch(error){
             setAllNotes([]);
      }
    }

    useEffect(()=>{
      fetchAllNotes();
    },[])


  return (
     <div className="home">
      <header className="header_wrap">
       <a href="/"> <h1> <img width={20} src="https://res.cloudinary.com/dn3vbnvcs/image/upload/v1751981419/sticky-notes_nk4ikm.png" alt="" /> Real-Time Collaborative Notes App</h1></a>
      </header>

      <main className="main">
        <h2>Collaborate in Real-Time</h2>
        <p>
          Create and edit Note together with your team. Changes sync instantly across all devices.
        </p>

        <div className="card">
          <div className="icon">+</div>
          <h3>Create a New Note Room</h3>
          <p>Start collaborating with a Note</p>

          <textarea
            placeholder="Enter room name..."
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
          />

          <button disabled={loading} onClick={CreateDocumentHandler}>+ New Room</button>
        </div>


   {
    allNotes?.length > 0 && 
         <NotesGrid  notes={allNotes} />
   }
      </main>
    </div>
  )
}

export default HomePage