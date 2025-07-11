export function Loader( { message, className = "" }: { message?: string; className?: string } ) {
    return (
        <div className={`flex items-center justify-center h-full ${className}`}>
            <div className="loader"></div>
            {message && <span className="ml-2">{message}</span>}
        </div>
    );
}