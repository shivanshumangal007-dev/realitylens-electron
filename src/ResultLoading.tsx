import LoadingScreen from "./components/LoadingScreen";
import VerificationResultCard from "./components/VerificationResultCard";
type ResultLoadingProps = {
	result: any;
	status: string;
	isResultLoading: boolean;
};
const ResultLoading = ({
	result,
	status,
	isResultLoading,
}: ResultLoadingProps) => {
	if (!result && !isResultLoading) {
		return null;
	}

	return (
		<div className='pointer-events-none fixed inset-0 z-50'>
			{isResultLoading && <LoadingScreen status={status} />}
			{result && !isResultLoading && (
				<div className='pointer-events-auto'>
					<VerificationResultCard
						result={result}
						onClose={() => window.electronAPI?.finishVerification()}
					/>
				</div>
			)}
		</div>
	);
};

export default ResultLoading;
