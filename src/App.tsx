import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
	return (
		<div className='size-full dark bg-background text-foreground'>
			<BrowserRouter>
				<Routes>
					<Route
						path='/'
						element={<Home />}
					/>
					<Route
						path='/login'
						element={<Login />}
					/>
					<Route
						path='*'
						element={<Home />}
					/>
					<Route
						path='/dashboard'
						element={<Dashboard />}
					/>
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
