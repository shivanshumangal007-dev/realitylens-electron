import React, {
  ChangeEvent,
  DragEvent,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";
import { motion } from "motion/react";
import {
  FileText,
  Upload,
  X,
  Minimize2,
  MessageSquare,
  Share2,
  File,
} from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import {
  getJobResultHandler,
  getJobStatusHandler,
  submitImageHandler,
  submitTextHandler,
} from "../ApiHandler";
import CurrentSelectedHistory from "./CurrentSelectedHistory";

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

const NewVarification = ({
  username = "Shreyansh",
  onNewVerification,
}: {
  username?: string;
  onNewVerification?: () => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [textVerification, setTextVerification] = useState<string>("");
  const [jobStatus, setJobStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<"file" | "text">("file");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingIntervalRef = useRef<number | null>(null);
  const [result, setResult] = useState(null);
  const [shortcut, setShortcut] = useState<string>("CommandOrControl+Shift+L");

  useEffect(() => {
    if (window.electronAPI && window.electronAPI.getShortcut) {
      window.electronAPI.getShortcut().then((sc: string) => {
        if (sc) setShortcut(sc);
      });
    }
  }, []);

  const formatShortcutKey = (key: string) => {
    if (key === "CommandOrControl") {
      return "Cmd/Ctrl";
    }
    if (key === "Shift") return "⇧";
    if (key === "Alt") return "Alt";
    return key;
  };

  const acceptedFileTypes = useMemo(
    () => ["image/jpeg", "image/png"],
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
      if (onNewVerification) onNewVerification();
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
      try {
        const response = await submitTextHandler(textVerification);
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
    result: result,
  };
  return (
    <div className="relative flex flex-col h-full w-full">
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
        <CurrentSelectedHistory
          selectedcurrentHistory={selectedcurrentHistory}
          setSelectedCurrentHistory={setResult}
        />
      ) : (
        <div className="flex flex-col flex-1 h-full min-h-0">
          {/* Top Header */}
          <div className="flex justify-between items-start w-full mb-4 2xl:mb-8 shrink-0">
            <h1 className="text-2xl font-bold">Hey {username},</h1>
            <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground">
              <Minimize2 className="h-4 w-4" /> Minimise to System Tray
            </button>
          </div>

          {/* Center Content */}
          <div className="flex flex-col items-center justify-center flex-1 min-h-0 py-2">
            <div className="text-center mb-6 2xl:mb-10 shrink-0">
              <h1 className="mb-2 2xl:mb-4 text-3xl 2xl:text-4xl font-bold tracking-tight">
                What are we Investigating today?
              </h1>
              <p className="text-cyan-400 font-medium">
                Drop a screenshot, an image or claim below and we'll do
                the fact-checking for you.
              </p>
            </div>

            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-4xl rounded-2xl border border-white/10 bg-card/40 p-5 2xl:p-8 backdrop-blur shadow-2xl flex flex-col"
            >
              <div className="mb-4 2xl:mb-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
                <h2 className="text-xl font-bold">
                  Upload Files or Enter Text
                </h2>
                <div className="flex rounded-xl border border-white/10 bg-background/50 p-1">
                  <button
                    type="button"
                    onClick={() => setActiveMode("file")}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      activeMode === "file"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    File
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveMode("text")}
                    className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
                      activeMode === "text"
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Text
                  </button>
                </div>
              </div>

              <div className="mb-4 2xl:mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground shrink-0">
                <span>Try examples:</span>
                <button className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 transition-colors hover:bg-white/10">
                  <FileText className="h-3 w-3 text-blue-400" /> News article
                  screenshot
                </button>
                <button className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 transition-colors hover:bg-white/10">
                  <MessageSquare className="h-3 w-3 text-cyan-400" /> Political
                  claim
                </button>
                <button className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 transition-colors hover:bg-white/10">
                  <Share2 className="h-3 w-3 text-purple-400" /> Viral social
                  media post
                </button>
                
              </div>

              {activeMode === "file" ? (
                <div
                  onDragOver={(event) => {
                    event.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`rounded-2xl border border-dashed p-6 2xl:p-12 text-center transition-all ${
                    isDragging
                      ? "border-cyan-400 bg-cyan-500/10"
                      : "border-white/10 bg-background/40 hover:border-cyan-500/30 hover:bg-background/60"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={onFileChange}
                    accept=".jpg,.jpeg,.png"
                    className="hidden"
                  />
                  <div className="flex flex-col items-center justify-center">
                    <div className="mb-3 2xl:mb-4 rounded-2xl bg-cyan-500/10 p-3 2xl:p-4 text-cyan-400">
                      <Upload className="h-6 w-6" />
                    </div>
                    <p className="text-sm text-foreground mb-1">
                      Choose a file or drag and drop it here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4 2xl:mb-6">
                      JPG, PNG up to 50MB
                    </p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-white/10"
                    >
                      Browse File
                    </button>
                  </div>

                  {selectedFile && (
                    <div className="mx-auto mt-6 flex max-w-md items-center justify-between rounded-xl border border-white/10 bg-background/80 p-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-cyan-500/20 p-2">
                          <FileText className="h-4 w-4 text-cyan-400" />
                        </div>
                        <p className="truncate text-sm font-medium">
                          {selectedFile.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/20 hover:text-red-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-background/40 p-4 2xl:p-6">
                  <textarea
                    id="verificationText"
                    value={textVerification}
                    onChange={(event) =>
                      setTextVerification(event.target.value)
                    }
                    placeholder="Paste the claim, headline, or message you want to verify..."
                    className="min-h-[200px] w-full resize-y rounded-xl border border-white/10 bg-background/50 p-4 text-sm text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-cyan-500/50 focus:bg-background/80"
                  />
                  <div className="mt-3 flex justify-end">
                    <p className="text-xs text-muted-foreground">
                      {textVerification.length} characters
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 2xl:mt-6 flex flex-wrap justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-xl border border-white/10 bg-transparent px-6 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={submitHandler}
                  disabled={
                    isSubmitting ||
                    (activeMode === "file" ? !selectedFile : !canSubmitText)
                  }
                  className="rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 px-6 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "Send Verification"}
                </button>
              </div>

              {error && (
                <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              )}
            </motion.section>
          </div>

          {/* Bottom Text */}
          <div className="mt-auto pt-4 2xl:pt-8 pb-2 text-center text-sm font-medium text-muted-foreground shrink-0">
            Press the Universal HotKeys :{" "}
            <span className="text-foreground">
              {shortcut.split("+").map(formatShortcutKey).join(" + ")}
            </span>{" "}
            &gt; Select The Area by Dragging Mouse &gt; Get your Verdict Instantly !
          </div>
        </div>
      )}
    </div>
  );
};

export default NewVarification;
