import { Routes, Route, useLocation } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import OverlayDiv from "./Overlay";
import { useState } from "react";
import Setting from "./pages/Setting";
import NewSettings from "./pages/NewSetting";

function App() {
	const location = useLocation();
	const isOverlay = location.pathname === "/overlay";
	const [isResultLoading, setIsResultLoading] = useState(false)

	if (isOverlay) {
		return (
			<div className='size-full bg-transparent text-foreground'>
				<OverlayDiv isResultLoading={isResultLoading} setIsResultLoading={setIsResultLoading} />
			</div>
		);
	}
	if (isResultLoading) {
		return (
			<div className='size-full bg-transparent text-foreground'>
				<OverlayDiv isResultLoading={isResultLoading} setIsResultLoading={setIsResultLoading} />
			</div>
		);
	}

	return (
		<div className='size-full dark bg-background text-foreground'>
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
					path='/Register'
					element={<Register />}
				/>
				<Route
					path='/settings'
					element={<NewSettings />}
				/>
				<Route
					path='*'
					element={<Login />}
				/>
				<Route
					path='/dashboard'
					element={<Dashboard />}
				/>
				
			</Routes>
		</div>
	);
}

export default App;
