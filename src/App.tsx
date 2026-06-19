import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import OverlayDiv from "./Overlay";
import { useState, useEffect } from "react";
import NewSettings from "./pages/NewSetting";
import AppErrorBoundary from "./components/AppErrorBoundary";

function App() {
	const location = useLocation();
	const navigate = useNavigate();
	const isOverlay = location.pathname === "/overlay";
	const [isResultLoading, setIsResultLoading] = useState(false);

	useEffect(() => {
		const api = (window as any).electronAPI;
		if (api?.onNavigateToLogin) {
			api.onNavigateToLogin(() => {
				navigate("/login");
			});
		}
	}, [navigate]);

	if (isOverlay) {
		return (
			<div className='size-full bg-transparent text-foreground'>
				<OverlayDiv
					isResultLoading={isResultLoading}
					setIsResultLoading={setIsResultLoading}
				/>
			</div>
		);
	}
	if (isResultLoading) {
		return (
			<div className='size-full bg-transparent text-foreground'>
				<OverlayDiv
					isResultLoading={isResultLoading}
					setIsResultLoading={setIsResultLoading}
				/>
			</div>
		);
	}

	return (
		<div
			className={`size-full bg-background text-foreground dark`}
		>
			<AppErrorBoundary>
				<Routes>
					<Route
						path='/'
						element={<Navigate to="/dashboard" replace />}
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
						element={
							<NewSettings />
						}
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
			</AppErrorBoundary>
		</div>
	);
}

export default App;
