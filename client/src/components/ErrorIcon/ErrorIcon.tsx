import "./ErrorIcon.css";

export default function ErrorIcon () {
	return (
		<svg className="error-icon" aria-hidden="true" viewBox="0 0 12 12">
			<circle cx="6" cy="6" r="5.5" />
			<path
				d="
					M 6,3.5
					v 3
					M 6,8
					v .5
				"
			/>
		</svg>
	);
}