import type {Position} from "../../api/positions.ts";
import type {NoArgsCallback} from "../../types/callbacks.tsx";
import Button from "../Button";
import PendingOverlay from "../PendingOverlay";
import MessageOverlay from "../MessageOverlay";
import ConfirmationOverlay from "../ConfirmationOverlay";
import {useState} from "react";
import {sanitizeUrl} from "@braintree/sanitize-url";
import "./PositionDetails.css";

// TODO wire up edit button

export default function PositionDetails ({
	status,
	errorMessage,
	position,
	label,
	onRemove,
	clearError
}: PositionDetailsProps) {
	const [confirmingRemoval, setConfirmingRemoval] = useConfirmingRemoval(status);

	let pendingMessage = "Loading, please wait";

	if (status === "removing") {
		pendingMessage = "Removal pending, please wait";
	}

	return (
		<div className="position-details">
			<PendingOverlay
				showing={status === "loading" || status === "removing"}
				message={pendingMessage}
			>
				<MessageOverlay
					showing={status === "error"}
					title="Error"
					message={errorMessage ?? ""}
					onAcknowledge={clearError}
				>
					<ConfirmationOverlay
						showing={confirmingRemoval}
						title="Confirm Removal"
						message={(
							<p>
								<strong className="confirm-removal-question">
									Are you sure you wish to remove <i>{label}</i>?
								</strong>
								This cannot be undone.
							</p>
						)}
						yesButtonVariant="danger"
						onYes={onRemove}
						onNo={() => setConfirmingRemoval(false)}
					>
						{position && (
							<PositionDetailsData
								position={position}
								label={label}
								onRemove={() => setConfirmingRemoval(true)}
							/>
						)}
					</ConfirmationOverlay>
				</MessageOverlay>
			</PendingOverlay>
		</div>
	);
}

function PositionDetailsData ({position, label, onRemove}: PositionDetailsDataProps) {
	const bubbleStyle = {
		backgroundColor: position.status.color.background,
		color: position.status.color.text,
		borderColor: position.status.color.border
	};

	return (
		<article className="position-details-data">
			<header>
				<h2 className="header">{label}</h2>
				<div className="controls">
					<Button
						className="edit"
						onClick={() => console.log("open edit " + position.id)}
						aria-label="edit position"
					>
						Edit
					</Button>
					<Button
						variant="danger"
						className="remove"
						onClick={onRemove}
						aria-label="remove position"
					>
						Remove
					</Button>
				</div>
			</header>
			<section>
				<div className="responsive-row">
					<span className="bubble" style={bubbleStyle}>{position.status.name}</span>
					{position.dateApplied != null && (
						<span>
							<strong>Date Applied: </strong>
							<span>{new Date(position.dateApplied).toLocaleDateString("en-US")}</span>
						</span>
					)}
				</div>
				<div className="work-arrangement responsive-row">
					<span>
						<strong>Work Type: </strong>
						<span>{position.workArrangement.type}</span>
					</span>
					{position.workArrangement.travelMinutes != null && (
						<span>
							<strong>Travel Minutes: </strong>
							<span>{position.workArrangement.travelMinutes}</span>
						</span>
					)}
				</div>
				{position.notes != null && (
					<div className="notes">
						<h3>Notes</h3>
						<p>{position.notes}</p>
					</div>
				)}
				<div className="responsive-row">
					<div className="interviews">
						<h3>Interviews</h3>
						<ul>
							{position.interviews.map(interview => <Interview {...interview} />)}
						</ul>
					</div>
					<div className="important-links">
						<h3>Important Links</h3>
						<ul>
							{position.importantLinks.map(link => (
								<li>
									<a
										href={sanitizeUrl(link.url)}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span>{link.label}</span>
									</a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</article>
	);
}

function Interview ({label, scheduled, duration, location, meetingLink}: Position["interviews"][number]) {
	const scheduledDate = new Date(scheduled),
		durationParts = [];

	let durationContent = <></>,
		locationContent = <></>;

	if (duration?.hours) {
		durationParts.push(`${duration.hours} hrs`);
	}

	if (duration?.minutes) {
		durationParts.push(`${duration.minutes} min`);
	}

	if (location && meetingLink) {
		locationContent = (
			<p className="where">
				{location}
				<a
					href={sanitizeUrl(meetingLink)}
					target="_blank"
					rel="noopener noreferrer"
				>
					Join Meeting
				</a>
			</p>
		);
	} else if (location) {
		locationContent = <p className="where">{location}</p>;
	} else if (meetingLink) {
		locationContent = (
			<p className="where">
				Remote
				<a
					href={sanitizeUrl(meetingLink)}
					target="_blank"
					rel="noopener noreferrer"
				>
					Join Meeting
				</a>
			</p>
		);
	}

	if (durationParts.length) {
		durationContent = (
			<>
				{" "}
				&middot;
				{" " + durationParts.join(" ")}
			</>
		);
	}

	return (
		<li className="interview">
			<strong>{label}</strong>
			<p className="when">
				{scheduledDate.toLocaleDateString("en-US") + " "}
				&middot;
				{" " + scheduledDate.toLocaleTimeString("en-US")}
				{durationContent}
			</p>
			{locationContent}
		</li>
	);
}

function useConfirmingRemoval (
	status: PositionDetailsProps["status"]
): [boolean, React.Dispatch<React.SetStateAction<boolean>>] {
	const [previousStatus, setPreviousStatus] = useState<typeof status>(status),
		[confirmingRemoval, setConfirmingRemoval] = useState<boolean>(false);

	// setState during render resets confirmingRemoval synchronously when status changes,
	// avoiding a visible flash that useEffect (post-paint) would cause
	if (previousStatus !== status) {
		setPreviousStatus(status);
		setConfirmingRemoval(false);
	}

	return [confirmingRemoval, setConfirmingRemoval];
}

export type PositionDetailsProps = {
	position: Position | null,
	label: string,
	onRemove: NoArgsCallback,
	clearError: NoArgsCallback
} & (
	{
		status: "loading" | "removing" | "loaded",
		errorMessage: null
	} | {
		status: "error",
		errorMessage: string
	}
);

type PositionDetailsDataProps = {
	position: Position,
	label: string,
	onRemove: NoArgsCallback
};