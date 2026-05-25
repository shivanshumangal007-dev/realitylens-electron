import React from "react";

type AppErrorBoundaryState = {
	hasError: boolean;
	message: string;
};

class AppErrorBoundary extends React.Component<
	React.PropsWithChildren,
	AppErrorBoundaryState
> {
	constructor(props: React.PropsWithChildren) {
		super(props);
		this.state = {
			hasError: false,
			message: "",
		};
	}

	static getDerivedStateFromError(error: Error) {
		return {
			hasError: true,
			message: error.message || "Something went wrong while rendering the app.",
		};
	}

	componentDidCatch(error: Error) {
		console.error("App render error:", error);
	}

	render() {
		if (!this.state.hasError) {
			return this.props.children;
		}

		return (
			<div className='flex size-full items-center justify-center bg-background px-4 text-foreground'>
				<div className='w-full max-w-lg rounded-3xl border border-white/10 bg-card/70 p-8 text-center shadow-2xl backdrop-blur-xl'>
					<p className='text-xs uppercase tracking-[0.22em] text-red-300'>
						Application error
					</p>
					<h1 className='mt-3 text-3xl'>
						RealityLens stopped on a screen error
					</h1>
					<p className='mt-3 text-sm text-muted-foreground'>
						{this.state.message}
					</p>
					<div className='mt-6 flex flex-wrap justify-center gap-3'>
						<button
							type='button'
							onClick={() => window.location.reload()}
							className='rounded-xl bg-linear-to-r from-cyan-500 via-blue-500 to-purple-600 px-4 py-2 text-sm font-medium text-white'
						>
							Reload app
						</button>
						<button
							type='button'
							onClick={() => {
								window.location.hash = "#/login";
								window.location.reload();
							}}
							className='rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-foreground hover:bg-white/10'
						>
							Go to login
						</button>
					</div>
				</div>
			</div>
		);
	}
}

export default AppErrorBoundary;
