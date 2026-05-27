import {useState, useImperativeHandle, useEffect} from "react";
import Button from "../Button";
import "./PositionDetails.css";

export default function PositionDetails ({ref, id, onLabelChanged}: PositionDetailsProps) {
	const [cacheKey, setCacheKey] = useState<number>(1);

	useImperativeHandle(ref, () => ({
		reload: () => {
			setCacheKey(prior => prior + 1);
		}
	}), []);

	return (
		<PositionDetailsCore
			key={cacheKey}
			id={id}
			onLabelChanged={onLabelChanged}
		/>
	);
}

function PositionDetailsCore ({id, onLabelChanged}: Omit<PositionDetailsProps, "ref">) {
	const position = usePosition(id),
		positionLabel = `${position.company}: ${position.title}`,
		bubbleStyle = {
			"background-color": position.status.color.background,
			"color": position.status.color.text,
			"border-color": position.status.color.border
		};

	useEffect(() => {
		onLabelChanged(positionLabel);
	}, [positionLabel, onLabelChanged]);

	return (
		<article className="position-details">
			<header>
				<h2 className="header">{positionLabel}</h2>
				<div className="controls">
					<Button
						className="edit"
						onClick={() => console.log("open edit " + id)}
						aria-label="edit position"
					>
						Edit
					</Button>
					<Button
						variant="danger"
						className="remove"
						onClick={() => console.log("remove " + id)}
						aria-label="remove position"
					>
						Remove
					</Button>
				</div>
			</header>
			<section>
				<div className="responsive-row">
					<span className="bubble" style={bubbleStyle}>{position.status.name}</span>
					<span>
						<strong>Date Applied: </strong>
						<span>{new Date(position.dateApplied).toLocaleDateString("en-US")}</span>
					</span>
				</div>
				<div className="work-arrangement">
					<h3>Work Arrangement</h3>
					<div>
						<strong>Type: </strong>
						<span>{position.workArrangement.type}</span>
					</div>
					{position.workArrangement.travelMinutes !== null && (
						<div>
							<strong>Travel Minutes: </strong>
							<span>{position.workArrangement.travelMinutes}</span>
						</div>
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
									<a href={link.url}><span>{link.label}</span></a>
								</li>
							))}
						</ul>
					</div>
				</div>
			</section>
		</article>
	);
}

function Interview ({label, scheduled, duration, location, meetingLink}) {
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
		locationContent = <p className="where">{location} <a href={meetingLink}>Join Meeting</a></p>;
	} else if (location) {
		locationContent = <p className="where">{location}</p>;
	} else if (meetingLink) {
		locationContent = (
			<p className="where">
				Remote <a href={meetingLink}>Join Meeting</a>
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

// placeholder
function usePosition (id: number) {
	return {
		id,
		company: "Principal",
		title: "Software Engineer II",
		status: {
			id: 3,
			name: "Interviewing",
			color: {
				text: "#000000",
				background: "#ffd400",
				border: "#ffd400"
			}
		},
		dateApplied: "2026-05-26T15:30:00.000Z",
		workArrangement: {
			type: "Hybrid",
			travelMinutes: 18
		},
		notes: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed massa neque, pharetra ac dignissim a, hendrerit vitae mauris. Duis facilisis risus ut quam dictum pharetra. Vivamus lacinia fermentum sem vel rhoncus. Mauris ullamcorper lobortis tellus eget luctus. Donec fermentum ligula et ante accumsan auctor. Vivamus a elit et mi suscipit egestas. Maecenas auctor augue viverra facilisis eleifend. Ut sit amet nisi efficitur, efficitur magna ut, varius dolor. Maecenas et nibh in nibh mattis finibus. Nam dapibus libero quis euismod ornare. Aenean eget congue nunc.",
		importantLinks: [{
			label: "Job Posting",
			url: "https://testlink.com"
		}, {
			label: "Really Really really Really Really really Really Really really Really Really really long label",
			url: "https://testlink.com"
		}],
		interviews: [{
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			location: "4604 EP True Parkway Unit #4203, West Des Moines",
			meetingLink: "foo_bar"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				hours: 1,
				minutes: 30
			},
			location: "4604 EP True Parkway Unit #4203, West Des Moines"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				hours: 1
			},
			meetingLink: "foo_bar"
		}, {
			label: "Video Screening",
			scheduled: "2026-05-26T15:30:00.000Z",
			duration: {
				minutes: 30
			}
		}]
	};
}

export type PositionDetailsAPI = {
	reload: () => void
};

type PositionDetailsProps = {
	ref?: React.RefObject<PositionDetailsAPI | null>,
	id: number,
	onLabelChanged: (newLabel: string) => unknown
};