import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

interface Message {
	id: string;
	text: string;
	sender: "user" | "bot";
	timestamp: Date;
}

interface FloatingChatbotProps {
	onRequirementsRefined: (requirements: string) => void;
}

export const FloatingChatbot: React.FC<FloatingChatbotProps> = ({
	onRequirementsRefined,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [conversationStep, setConversationStep] = useState<
		"understanding" | "scope" | "mapping" | "refinement" | "final"
	>("understanding");
	const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			text: `👋 **Welcome! I'm your AI Requirements Assistant.**

I'm here to transform your raw idea into a refined, ready-to-implement user requirement aligned with business goals and system architecture.

**Let's start with understanding your requirement:**

🧭 **Step 1: Understanding the Requirement**

To better understand your requirement, could you please tell me:

**What specific problem are you trying to solve or what goal are you aiming to achieve?**

Please describe your business goal in detail.`,
			sender: "bot",
			timestamp: new Date(),
		},
	]);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		if (messagesEndRef.current && shouldAutoScroll) {
			messagesEndRef.current.scrollIntoView({
				behavior: "smooth",
			});
		}
	};

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const element = e.currentTarget;
		const isNearBottom =
			element.scrollHeight -
				element.scrollTop -
				element.clientHeight <
			50;
		setShouldAutoScroll(isNearBottom);
	};

	useEffect(() => {
		if (messages.length > 1 && shouldAutoScroll) {
			const timer = setTimeout(() => {
				scrollToBottom();
			}, 100);

			return () => clearTimeout(timer);
		}
	}, [messages, shouldAutoScroll]);

	const sendMessage = async (text: string) => {
		if (!text.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text,
			sender: "user",
			timestamp: new Date(),
		};

		setMessages((prev) => [...prev, userMessage]);
		setInputText("");
		setIsLoading(true);

		try {
			const aiAgentUrl = import.meta.env
				.VITE_AI_AGENT_URL as string;
			if (!aiAgentUrl) {
				throw new Error(
					"VITE_AI_AGENT_URL environment variable is not set"
				);
			}

			const endpointUrl = aiAgentUrl.endsWith("/ask")
				? aiAgentUrl
				: `${aiAgentUrl}/ask`;
			const response = await fetch(endpointUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					user_query: text,
					agent_role: `You are an expert Requirements Analyst and Product Owner responsible for transforming a raw idea into a refined, ready-to-implement user requirement, aligned with business goals and system architecture.

Your tasks:

🧭 1. Understand the Requirement
Ask ONE question at a time to understand the problem, goal, and user need.
Determine the user persona and usage context.

🧩 2. Define Scope & Structure the Requirement
Break it into epics, features, or user stories using INVEST principles.
Clearly call out what is in scope, out of scope, and any dependencies.

🔄 3. Map to System & Process
Ask the user:
Which business process or workflow does this requirement affect?
Which MAPI, service, or backend API will this requirement likely touch or need changes in?
Are there existing UI components, database entities, or third-party systems involved?

🔍 4. Refine via Q&A
Dive deep into edge cases, failure scenarios, and data validation.
Confirm performance, scalability, or security concerns.

✅ 5. Final Output
Provide the following deliverables:

📄 User Story / Feature Description
As a [user persona], I want to [do something] so that [value or benefit].

✅ Acceptance Criteria (Gherkin style preferred)
Given [context]
When [action]
Then [expected outcome]

🔧 MAPI / Service / Process Mapping
Related API(s): e.g., POST /quick-save
Business Process Impacted: e.g., Quote Submission
Dependencies: e.g., Notification service, Audit logs

⚠️ Open Questions / Assumptions / Risks
List unknowns, risks, or validation needs

**CRITICAL**: Ask ONLY ONE question at a time. Wait for the user's response before asking the next question. This helps prevent overwhelming the user and ensures thorough understanding of each aspect.

**Question Sequence**:
1. Business Goal: "What specific problem are you trying to solve?"
2. User Persona: "Who are the primary users of this feature?"
3. Usage Context: "How do users currently manage this need?"
4. Scope: "What's in scope and what's out of scope?"
5. System Impact: "Which business processes will this affect?"
6. Technical Details: "What APIs or systems will this touch?"
7. Edge Cases: "What happens if things go wrong?"
8. Final Validation: "Are you ready to generate structured requirements?"

**Current conversation step**: ${conversationStep}`,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to get response");
			}

			const data = await response.json();

			let formattedResponse =
				data.response ||
				data.message ||
				data.content ||
				"No response received";

			const botMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: formattedResponse,
				sender: "bot",
				timestamp: new Date(),
			};

			setMessages((prev) => [...prev, botMessage]);

			if (data.suggestions && data.suggestions.length > 0) {
				const refinedRequirements =
					data.suggestions.join("\n\n");
				onRequirementsRefined(refinedRequirements);
			} else if (
				(data.response &&
					data.response.includes("ready")) ||
				data.response.includes("final")
			) {
				onRequirementsRefined(data.response);
			}
		} catch (error) {
			console.error("Error sending message:", error);
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: "I'm sorry, I'm having trouble connecting to the AI Requirements Assistant service. Please check if the service is running and try again.",
				sender: "bot",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage(inputText);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage(inputText);
		}
	};

	return (
		<>
			{/* Floating Chat Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-lg transition-all duration-300 ${
					isOpen
						? "bg-red-500 hover:bg-red-600 text-white"
						: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
				}`}
				title={
					isOpen
						? "Close Chat"
						: "Open Requirements Assistant"
				}
			>
				{isOpen ? (
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				) : (
					<svg
						className="w-6 h-6"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
						/>
					</svg>
				)}
			</button>

			{/* Floating Chat Window */}
			{isOpen && (
				<div className="fixed bottom-24 right-6 z-40 w-[480px] h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
					{/* Header */}
					<div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
									<svg
										className="w-6 h-6"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={
												2
											}
											d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
										/>
									</svg>
								</div>
								<div>
									<h3 className="font-semibold text-lg">
										AI
										Requirements
										Assistant
									</h3>
									<p className="text-sm text-blue-100">
										Transform
										your
										ideas
										into
										structured
										requirements
									</p>
								</div>
							</div>
							<button
								onClick={() =>
									setIsOpen(
										false
									)
								}
								className="text-white hover:text-gray-200 transition-colors"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={
											2
										}
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
					</div>

					{/* Messages */}
					<div
						className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth relative"
						onScroll={handleScroll}
					>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${
									message.sender ===
									"user"
										? "justify-end"
										: "justify-start"
								}`}
							>
								<div
									className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
										message.sender ===
										"user"
											? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
											: "bg-white border border-gray-200 text-gray-800 shadow-sm"
									}`}
								>
									<p className="text-sm whitespace-pre-wrap leading-relaxed">
										{
											message.text
										}
									</p>
									<p
										className={`text-xs mt-2 ${
											message.sender ===
											"user"
												? "opacity-70"
												: "text-gray-500"
										}`}
									>
										{message.timestamp.toLocaleTimeString(
											[],
											{
												hour: "2-digit",
												minute: "2-digit",
											}
										)}
									</p>
								</div>
							</div>
						))}

						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-white border border-gray-200 text-gray-800 px-4 py-3 rounded-2xl shadow-sm">
									<div className="flex items-center space-x-2">
										<div className="flex space-x-1">
											<div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
											<div
												className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
												style={{
													animationDelay:
														"0.1s",
												}}
											></div>
											<div
												className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
												style={{
													animationDelay:
														"0.2s",
												}}
											></div>
										</div>
										<span className="text-sm font-medium">
											AI
											is
											thinking...
										</span>
									</div>
								</div>
							</div>
						)}

						<div ref={messagesEndRef} />

						{/* Scroll to bottom button */}
						{!shouldAutoScroll && (
							<button
								onClick={() => {
									setShouldAutoScroll(
										true
									);
									scrollToBottom();
								}}
								className="absolute bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
								title="Scroll to bottom"
							>
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={
											2
										}
										d="M19 14l-7 7m0 0l-7-7m7 7V3"
									/>
								</svg>
							</button>
						)}
					</div>

					{/* Input */}
					<div className="p-4 border-t border-gray-200 bg-gray-50">
						<form
							onSubmit={handleSubmit}
							className="flex space-x-2"
						>
							<input
								type="text"
								value={
									inputText
								}
								onChange={(e) =>
									setInputText(
										e
											.target
											.value
									)
								}
								onKeyPress={
									handleKeyPress
								}
								placeholder="Type your message..."
								className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
								disabled={
									isLoading
								}
							/>
							<button
								type="submit"
								disabled={
									isLoading ||
									!inputText.trim()
								}
								className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
							>
								<svg
									className="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={
											2
										}
										d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
									/>
								</svg>
							</button>
						</form>
					</div>
				</div>
			)}
		</>
	);
};
