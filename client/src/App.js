import React from "react"
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

import Login from "./login"
const App = _ => {
    return (
        <div className="App">
            <h1> Hello, Movies! </h1>
            <Router>
                <div>
                    <nav>
                        <ul>
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/login">Login</Link></li>
                        </ul>
                    </nav>
                    <Route path="/login" component={Login} />
                </div>
            </Router>
        </div>
    )
}

export default App
