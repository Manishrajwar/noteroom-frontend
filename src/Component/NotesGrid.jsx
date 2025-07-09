import "./component.css";
import { CgNotes } from "react-icons/cg";
import { useNavigate } from "react-router-dom";

const NotesGrid = ({ notes }) => {

    const navigate = useNavigate();

  return (
    <section className="notes-grid-section">
      <h2>Your Notes</h2>
      <div className="notes-grid">
        {notes?.map((note) => (
       <>
          <div onClick={()=>navigate(`/notes/${note._id}`)} className="note-card" key={note?.id}>
            <div className="note-card-header">
              <h3>{note?.title}</h3>
            
            </div>
            <CgNotes fontSize={80} />

            <p className="note-updated">
              Last updated: {new Date(note?.updatedAt).toLocaleString()}
            </p>
          </div> 

       </>
        ))}
      </div>
    </section>
  );
};

export default NotesGrid;
