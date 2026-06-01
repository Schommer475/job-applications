import {useContext} from "react";
import UserContext from "./UserContext.tsx";

export default function useUserId () {
	const userId = useContext(UserContext);

	if (userId === null) {
		throw new Error("useUserId can only be used within a UserContext");
	}

	return userId;
}