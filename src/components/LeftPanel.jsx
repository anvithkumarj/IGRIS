export default function LeftPanel({

    status,

    name,

    language

}){

    return(

        <div className="left-panel">

            <div className="left-title">

                SYSTEM

            </div>

            <div className="status-card">

                <div className="status-label">

                    STATUS

                </div>

                <div className="status-value">

                    {status}

                </div>

                <div className="ai-meter">

                    <span></span>

                </div>

            </div>

            <div className="status-card">

                <div className="status-label">

                    USER

                </div>

                <div className="status-value">

                    {name}

                </div>

            </div>

            <div className="status-card">

                <div className="status-label">

                    LANGUAGE

                </div>

                <div className="status-value">

                    {language}

                </div>

            </div>

            <div className="status-card">

                <div className="status-label">

                    NEURAL CORE

                </div>

                <div className="status-value">

                    100%

                </div>

                <div className="ai-meter">

                    <span></span>

                </div>

            </div>

        </div>

    )

}