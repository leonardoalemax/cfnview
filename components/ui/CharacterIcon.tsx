import Image from "next/image";
import { characterImg } from "../../lib/types";

interface Props {
	toolName: string;
	side?: "l" | "r";
	className?: string;
}

export default function CharacterIcon({
	toolName,
	side = "l",
	className = "",
}: Props) {
	const src = characterImg(toolName, side);
	const label = toolName;
	let classNameSize = className || `sm:w-24 sm:h-24 w-16 h-16`;

	return (
		<div
			className={`sf6-panel relative ${classNameSize} shrink-0 mx-auto sm:mx-0`}>
			<img src={src} alt={label} className={`object-contain`} />
		</div>
	);
}
