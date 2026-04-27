import React from "react";

const CARD_STYLE: React.CSSProperties = {
	borderRadius: 20,
	overflow: "hidden",
};

interface Props {
	style?: React.CSSProperties;
}

export default function ChromaBlock({ style }: Props) {
	return (
		<div
			style={{
				...CARD_STYLE,
				background: "#00FF00",
				...style,
			}}
		/>
	);
}
