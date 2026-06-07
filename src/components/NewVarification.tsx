import React, {
	ChangeEvent,
	DragEvent,
	useMemo,
	useRef,
	useState,
} from "react";
import { motion } from "motion/react";
import { FileText, Upload, X } from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import {
	getJobResultHandler,
	getJobStatusHandler,
	submitImageHandler,
} from "../ApiHandler";
import CurrentSelectedHistory from "./CurrentSelectedHistory";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const NewVarification = () => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [textVerification, setTextVerification] = useState("");
	const [jobStatus, setJobStatus] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [activeMode, setActiveMode] = useState<"file" | "text">("file");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const pollingIntervalRef = useRef<number | null>(null);
	const [result, setResult] = useState(null);

	const acceptedFileTypes = useMemo(
		() => ["image/jpeg", "image/png", "application/pdf", "video/mp4"],
		[],
	);

	const validateAndSetFile = (file: File | null) => {
		if (!file) return;
		if (file.size > MAX_FILE_SIZE_BYTES) {
			return;
		}
		if (!acceptedFileTypes.includes(file.type)) {
			return;
		}
		setSelectedFile(file);
	};

	const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		validateAndSetFile(event.target.files?.[0] ?? null);
	};

	const handleDrop = (event: DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		setIsDragging(false);
		validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
	};

	const clearFile = () => {
		setSelectedFile(null);
		if (fileInputRef.current) fileInputRef.current.value = "";
	};

	const clearPolling = () => {
		if (pollingIntervalRef.current) {
			window.clearInterval(pollingIntervalRef.current);
			pollingIntervalRef.current = null;
		}
	};

	const canSubmitText = textVerification.trim().length > 0;
	const getStatusOfJob = async (jobId: string) => {
		try {
			const response = await getJobStatusHandler(jobId);
			console.log("Job status response:", response.data.status);
			setJobStatus(response.data.status);
			if (
				response.data.status === "done" ||
				response.data.status === "failed"
			) {
				clearPolling();
				await GetfinalResult(jobId);
				return;
			}
			clearPolling();
			pollingIntervalRef.current = window.setInterval(async () => {
				try {
					const nextResponse = await getJobStatusHandler(jobId);
					console.log("Job status response:", nextResponse.data.status);
					setJobStatus(nextResponse.data.status);
					if (
						nextResponse.data.status === "done" ||
						nextResponse.data.status === "failed"
					) {
						if (pollingIntervalRef.current) {
							window.clearInterval(pollingIntervalRef.current);
							pollingIntervalRef.current = null;
						}
						await GetfinalResult(jobId);
					}
				} catch (error) {
					console.error("Job status polling error:", error);
					if (pollingIntervalRef.current) {
						window.clearInterval(pollingIntervalRef.current);
						pollingIntervalRef.current = null;
					}
					setIsSubmitting(false);
					setError(
						error instanceof Error
							? error.message
							: "Unable to track verification progress.",
					);
				}
			}, 1000);
		} catch (error) {
			console.error("Job status error:", error);
			setIsSubmitting(false);
			setError(
				error instanceof Error
					? error.message
					: "Unable to check verification status.",
			);
		}
	};
	const GetfinalResult = async (jobId: string) => {
		try {
			const response = await getJobResultHandler(jobId);
			console.log("Job result response:", response.data);
			setResult(response.data);
			setIsSubmitting(false);
		} catch (error) {
			console.error("Job result error:", error);
			setIsSubmitting(false);
			setError(
				error instanceof Error
					? error.message
					: "Unable to load verification result.",
			);
		}
	};
	const submitHandler = async () => {
		setError(null);
		setResult(null);
		clearPolling();
		setIsSubmitting(true);

		if (activeMode === "file" && selectedFile) {
			try {
				const response = await submitImageHandler(selectedFile);
				await getStatusOfJob(response.data.job_id);
			} catch (submissionError) {
				console.error("Submission error:", submissionError);
				setIsSubmitting(false);
				setError(
					submissionError instanceof Error
						? submissionError.message
						: "Unable to submit the file for verification.",
				);
			}
			return;
		}

		if (activeMode === "text" && canSubmitText) {
			setJobStatus("Preparing text verification...");
			window.setTimeout(() => {
				setIsSubmitting(false);
				setJobStatus("");
			}, 1400);
			return;
		}
	};

	const handleReset = () => {
		clearPolling();
		clearFile();
		setTextVerification("");
		setJobStatus("");
		setError(null);
		setIsSubmitting(false);
		setResult(null);
	};
  const selectedcurrentHistory = {
    result: result
  };
	return (
		<div className='relative flex h-full w-full px-4 py-8'>
			{isSubmitting && (
				<LoadingScreen
					status={
						jobStatus ||
						(activeMode === "text"
							? "Preparing text verification..."
							: "Uploading file...")
					}
					fullScreen
				/>
			)}
			{result ? (
				<CurrentSelectedHistory selectedcurrentHistory={selectedcurrentHistory} setSelectedCurrentHistory={setResult} />
			) : (
				<motion.section
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4 }}
					className='w-full max-w-4xl rounded-2xl border border-border bg-card/50 p-4 backdrop-blur sm:p-6'
				>
					<div className='relative w-full'>
						<div className='mb-6 flex flex-wrap items-center justify-between gap-3'>
							<div>
								<h2 className='text-2xl'>Upload files</h2>
								<p className='text-sm text-muted-foreground'>
									Select and upload a file or verify custom text.
								</p>
							</div>
							<div className='rounded-xl border border-border/70 bg-background/40 p-1'>
								<button
									type='button'
									onClick={() => setActiveMode("file")}
									className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
									activeMode === "file"
										? "bg-cyan-500/10 text-cyan-500 font-medium"
										: "text-muted-foreground hover:text-foreground"
								}`}
								>
									File
								</button>
								<button
									type='button'
									onClick={() => setActiveMode("text")}
									className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
									activeMode === "text"
										? "bg-cyan-500/10 text-cyan-500 font-medium"
										: "text-muted-foreground hover:text-foreground"
								}`}
								>
									Text
								</button>
							</div>
						</div>

						{activeMode === "file" ? (
							<div
								onDragOver={(event) => {
									event.preventDefault();
									setIsDragging(true);
								}}
								onDragLeave={() => setIsDragging(false)}
								onDrop={handleDrop}
								className={`rounded-2xl border border-dashed p-5 transition-colors sm:p-8 ${
								isDragging
									? "border-cyan-400 bg-cyan-500/10"
									: "border-border bg-background/30 hover:border-cyan-500/30"
							}`}
							>
								<input
									ref={fileInputRef}
									type='file'
									onChange={onFileChange}
									accept='.jpg,.jpeg,.png,.pdf,.mp4'
									className='hidden'
								/>
								<div className='flex flex-col items-center justify-center text-center'>
									<div className='mb-4 rounded-xl bg-cyan-500/10 p-3 text-cyan-500'>
										<Upload className='h-6 w-6' />
									</div>
									<p className='text-sm text-muted-foreground'>
										Choose a file or drag and drop it here
									</p>
									<p className='mt-1 text-xs text-muted-foreground'>
										JPG, PNG, PDF, MP4 up to 50MB
									</p>
									<button
										type='button'
										onClick={() => fileInputRef.current?.click()}
										className='mt-4 rounded-xl border border-border bg-background/50 px-5 py-2 text-sm text-foreground transition-colors hover:border-cyan-500/30 hover:bg-cyan-500/5'
									>
										Browse File
									</button>
								</div>

								{selectedFile && (
									<div className='mt-5 flex items-center justify-between rounded-xl border border-border bg-background/50 p-3'>
										<div className='flex min-w-0 items-center gap-2'>
											<FileText className='h-4 w-4 shrink-0 text-cyan-500' />
											<p className='truncate text-sm'>{selectedFile.name}</p>
										</div>
										<button
											type='button'
											onClick={clearFile}
											className='rounded-lg p-1 text-muted-foreground hover:bg-accent hover:text-foreground'
										>
											<X className='h-4 w-4' />
										</button>
									</div>
								)}
							</div>
						) : (
							<div className='rounded-2xl border border-border bg-background/30 p-5 sm:p-6'>
								<label
									htmlFor='verificationText'
									className='mb-3 block text-sm text-muted-foreground'
								>
									Type your text for verification
								</label>
								<textarea
									id='verificationText'
									value={textVerification}
									onChange={(event) => setTextVerification(event.target.value)}
									placeholder='Paste the claim, headline, or message you want to verify...'
									className='min-h-40 w-full resize-y rounded-xl border border-border bg-card/60 p-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-cyan-500/50 focus:bg-cyan-500/5'
								/>
								<p className='mt-2 text-xs text-muted-foreground'>
									{textVerification.length} characters
								</p>
							</div>
						)}

						<div className='mt-5 flex flex-wrap justify-end gap-3'>
							<button
								type='button'
								onClick={handleReset}
								className='rounded-xl border border-border bg-background/40 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors'
							>
								Reset
							</button>
							<button
								type='button'
								onClick={submitHandler}
								disabled={
									isSubmitting ||
									(activeMode === "file" ? !selectedFile : !canSubmitText)
								}
								className='rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50 transition-all hover:shadow-lg hover:shadow-cyan-500/20'
							>
								{isSubmitting ? "Processing..." : "Send Verification"}
							</button>
						</div>

						{error && (
							<p className='mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-400'>
								{error}
							</p>
						)}
					</div>
				</motion.section>
			)}
		</div>
	);
};

export default NewVarification;
``