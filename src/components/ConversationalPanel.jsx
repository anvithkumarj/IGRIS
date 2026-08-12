export default function ConversationPanel({

    transcript,

    answer

}){

    return(

        <div className="terminal-body">

            <div className="user-message">

                <strong>USER &gt;</strong>

                {transcript || "Awaiting command..."}

            </div>

            <div className="ai-message">

                <strong>IGRIS &gt;</strong>

                {answer || "Standing by..."}

            </div>

            <span className="cursor"></span>

        </div>

    );

}