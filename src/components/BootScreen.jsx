

export default function BootScreen({

    bootProgress,

    bootMessage,

}) {

    return (

        <main className="boot-screen">

            <div className="boot-card glass">

                <div className="boot-reactor">

                    <div className="boot-ring r1"></div>
                    <div className="boot-ring r2"></div>
                    <div className="boot-ring r3"></div>

                    <div className="boot-core"></div>

                </div>

                <span className="boot-label">

                    IGRIS AI OPERATING SYSTEM

                </span>

                <h1>IGRIS</h1>

                <h3>BOOTING SYSTEM</h3>

                <div className="boot-progress">

                    <div
                        className="boot-progress-fill"
                        style={{
                            width: `${bootProgress}%`,
                        }}
                    />

                </div>

                <p className="boot-message">

                    {bootMessage}

                </p>

                <h2>

                    {bootProgress}%

                </h2>

            </div>

        </main>

    );

}

